<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">호실 관리</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>호실</v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6"></v-col>
              <v-col cols="12" md="6" class="d-flex justify-end align-center">
                <v-btn color="green" dark class="mr-2" @click="downloadExcelData" :loading="loading">엑셀 다운로드</v-btn>
                <input type="file" ref="excelUploadInput" style="display: none;" @change="handleFileUpload" accept=".xlsx, .xls" />
                <v-btn color="blue" dark @click="triggerFileUpload" :loading="loading">엑셀 업로드</v-btn>
              </v-col>
            </v-row>
            <v-data-table
              :headers="filteredHeaders"
              :items="rooms"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>호실 목록</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">새 호실</v-btn>
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
                <v-text-field v-model="editedItem.building_id" label="건물 ID"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.room_number" label="호실 번호"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.floor" label="층"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.room_type"
                  :items="['1룸', '2룸']"
                  label="방 종류"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.area" label="면적"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.monthly_rent" label="월세"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.deposit" label="보증금"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.status"
                  :items="['임대가능', '임대중', '수리중']"
                  label="상태"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.description" label="설명"></v-textarea>
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

const rooms = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  building_id: '',
  room_number: '',
  floor: '',
  room_type: '',
  area: '',
  monthly_rent: '',
  deposit: '',
  status: '',
  description: '',
});
const defaultItem = {
  building_id: '',
  room_number: '',
  floor: '',
  room_type: '',
  area: '',
  monthly_rent: '',
  deposit: '',
  status: '',
  description: '',
};
const loading = ref(false);
const excelUploadInput = ref(null);
const snackbar = ref({
  show: false,
  message: '',
  color: '',
});

const baseHeaders = [
  { title: '건물 ID', key: 'building_id' },
  { title: '호실 번호', key: 'room_number' },
  { title: '층', key: 'floor' },
  { title: '방 종류', key: 'room_type' },
  { title: '면적', key: 'area' },
  { title: '월세', key: 'monthly_rent' },
  { title: '보증금', key: 'deposit' },
  { title: '상태', key: 'status' },
];

const filteredHeaders = computed(() => {
  if (isAdmin.value) {
    return [...baseHeaders, { title: '작업', key: 'actions', sortable: false }];
  } else {
    return baseHeaders;
  }
});

const isAdmin = computed(() => {
  return store.state.auth.user && store.state.auth.user.role === 'admin';
});

const formTitle = computed(() => {
  return editedIndex.value === -1 ? '새 호실' : '호실 수정';
});

const fetchRooms = async () => {
  try {
    const response = await apiClient.get('/rooms');
    rooms.value = response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = rooms.value.indexOf(item);
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
      await apiClient.put(`/rooms/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create new item
      await apiClient.post('/rooms', editedItem.value);
    }
    closeDialog();
    fetchRooms(); // Refresh list
    showSnackbar('저장되었습니다.', 'success');
  } catch (error) {
    console.error('Error saving room:', error);
    showSnackbar('저장 중 오류가 발생했습니다.', 'error');
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/rooms/${item.id}`);
      fetchRooms(); // Refresh list
      showSnackbar('삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Error deleting room:', error);
      showSnackbar('삭제 중 오류가 발생했습니다.', 'error');
    }
  }
};

const downloadExcelData = async () => {
  loading.value = true;
  try {
    const response = await downloadExcel('/rooms');
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '호실_목록.xlsx');
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
    await uploadExcel('/rooms', file);
    showSnackbar('엑셀 업로드가 완료되었습니다.', 'success');
    fetchRooms(); // Refresh list after upload
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

onMounted(fetchRooms);
</script>
