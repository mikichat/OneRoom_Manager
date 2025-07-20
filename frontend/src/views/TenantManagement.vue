<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">임차인 관리</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>임차인</v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="이름, 전화번호, 또는 이메일로 검색"
                  clearable
                  density="compact"
                  hide-details
                  variant="outlined"
                  @input="fetchTenantsDebounced"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="isStudentFilter"
                  :items="isStudentOptions"
                  label="학생 여부"
                  clearable
                  density="compact"
                  hide-details
                  variant="outlined"
                  @update:model-value="fetchTenants"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3" class="d-flex justify-end align-center">
                <v-btn color="green" dark class="mr-2" @click="downloadExcelData" :loading="loading">엑셀 다운로드</v-btn>
                <input type="file" ref="excelUploadInput" style="display: none;" @change="handleFileUpload" accept=".xlsx, .xls" />
                <v-btn color="blue" dark @click="triggerFileUpload" :loading="loading">엑셀 업로드</v-btn>
              </v-col>
            </v-row>
            <v-data-table
              :headers="filteredHeaders"
              :items="tenants"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>임차인 목록</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">새 임차인</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon v-if="isAdmin" small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon v-if="isAdmin" small @click="deleteItem(item)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.name" label="이름"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.phone" label="전화번호"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.email" label="이메일"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.birth_first_six" label="생년월일 (앞 6자리)"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.emergency_contact" label="비상 연락처"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.emergency_name" label="비상 연락처 이름"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-checkbox v-model="editedItem.is_student" label="학생 여부"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.school_name" label="학교 이름"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">취소</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient, { downloadExcel, uploadExcel } from '../api';
// import * as XLSX from 'xlsx'; // Uncomment if client-side excel processing is needed

const store = useStore();
const tenants = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const searchQuery = ref('');
const isStudentFilter = ref(null);

const isStudentOptions = [
  { title: '전체', value: null },
  { title: '학생', value: true },
  { title: '비학생', value: false },
];

const loading = ref(false);
const excelUploadInput = ref(null);
const snackbar = ref({
  show: false,
  message: '',
  color: '',
});

const editedItem = ref({
  name: '',
  phone: '',
  email: '',
  birth_first_six: '',
  emergency_contact: '',
  emergency_name: '',
  is_student: false,
  school_name: '',
});
const defaultItem = {
  name: '',
  phone: '',
  email: '',
  birth_first_six: '',
  emergency_contact: '',
  emergency_name: '',
  is_student: false,
  school_name: '',
};

const baseHeaders = [
  { title: '이름', key: 'name' },
  { title: '전화번호', key: 'phone' },
  { title: '이메일', key: 'email' },
  { title: '학생 여부', key: 'is_student' },
  { title: '학교 이름', key: 'school_name' },
];

const headers = computed(() => {
  if (isAdmin.value) {
    return [...baseHeaders, { title: '작업', key: 'actions', sortable: false }];
  } else {
    return baseHeaders;
  }
});

const filteredHeaders = computed(() => {
  return headers.value.filter(header => {
    if (header.key === 'actions') {
      return isAdmin.value;
    }
    return true;
  });
});

const isAdmin = computed(() => {
  return store.state.auth.user && store.state.auth.user.role === 'admin';
});

const formTitle = computed(() => {
  return editedIndex.value === -1 ? '새 임차인' : '임차인 수정';
});

let debounceTimeout = null;
const fetchTenantsDebounced = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(() => {
    fetchTenants();
  }, 300);
};

const fetchTenants = async () => {
  try {
    const params = {};
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    if (isStudentFilter.value !== null) {
      params.is_student = isStudentFilter.value;
    }

    const response = await apiClient.get('/tenants', { params });
    tenants.value = response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = tenants.value.indexOf(item);
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

const saveItem = async () => {
  try {
    if (editedIndex.value > -1) {
      // Update item
      await apiClient.put(`/tenants/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create new item
      await apiClient.post('/tenants', editedItem.value);
    }
    closeDialog();
    fetchTenants(); // Refresh list
    showSnackbar('저장되었습니다.', 'success');
  } catch (error) {
    console.error('Error saving tenant:', error);
    showSnackbar('저장 중 오류가 발생했습니다.', 'error');
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/tenants/${item.id}`);
      fetchTenants(); // Refresh list
      showSnackbar('삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      showSnackbar('삭제 중 오류가 발생했습니다.', 'error');
    }
  }
};

const downloadExcelData = async () => {
  loading.value = true;
  try {
    const response = await downloadExcel('/tenants');
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '임차인_목록.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSnackbar('엑셀 다운로드가 완료되었습니다.', 'success');
  } catch (error) {
    console.error('Error downloading excel:', error);
    showSnackbar('엑셀 다운로드 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const triggerFileUpload = () => {
  excelUploadInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  loading.value = true;
  try {
    await uploadExcel('/tenants', file);
    showSnackbar('엑셀 업로드가 완료되었습니다.', 'success');
    fetchTenants(); // Refresh list after upload
  } catch (error) {
    console.error('Error uploading excel:', error);
    showSnackbar('엑셀 업로드 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
    event.target.value = null; // Clear the input so the same file can be uploaded again
  }
};

const showSnackbar = (message, color) => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

onMounted(fetchTenants);
</script>
