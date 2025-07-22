<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">방 옵션 관리</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>방 옵션</v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchRoomId"
                  label="호실 ID로 검색"
                  clearable
                  density="compact"
                  hide-details
                  variant="outlined"
                  @input="fetchRoomOptionsDebounced"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end align-center">
                <v-btn color="green" dark class="mr-2" @click="downloadExcelData" :loading="loading">엑셀 다운로드</v-btn>
                <input type="file" ref="excelUploadInput" style="display: none;" @change="handleFileUpload" accept=".xlsx, .xls" />
                <v-btn color="blue" dark @click="triggerFileUpload" :loading="loading">엑셀 업로드</v-btn>
              </v-col>
            </v-row>
            <v-data-table
              :headers="filteredHeaders"
              :items="roomOptions"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>방 옵션 목록</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">새 방 옵션</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.room_number="{ item }">
                {{ item.room ? item.room.room_number : 'N/A' }}
              </template>
              <template v-slot:item.refrigerator="{ item }">
                <v-icon :color="item.refrigerator ? 'green' : 'red'">
                  {{ item.refrigerator ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.washing_machine="{ item }">
                <v-icon :color="item.washing_machine ? 'green' : 'red'">
                  {{ item.washing_machine ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.air_conditioner="{ item }">
                <v-icon :color="item.air_conditioner ? 'green' : 'red'">
                  {{ item.air_conditioner ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.induction="{ item }">
                <v-icon :color="item.induction ? 'green' : 'red'">
                  {{ item.induction ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.microwave="{ item }">
                <v-icon :color="item.microwave ? 'green' : 'red'">
                  {{ item.microwave ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.tv="{ item }">
                <v-icon :color="item.tv ? 'green' : 'red'">
                  {{ item.tv ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              <template v-slot:item.wifi_router="{ item }">
                <v-icon :color="item.wifi_router ? 'green' : 'red'">
                  {{ item.wifi_router ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
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

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.room_id"
                  :items="rooms"
                  item-title="room_number"
                  item-value="id"
                  label="호실 선택"
                  :rules="[v => !!v || '호실은 필수입니다.']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.refrigerator" label="냉장고"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.washing_machine" label="세탁기"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.air_conditioner" label="에어컨"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.induction" label="인덕션"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.microwave" label="전자레인지"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.tv" label="TV"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox v-model="editedItem.wifi_router" label="무선 공유기"></v-checkbox>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import apiClient, { downloadExcel, uploadExcel } from '../api';
// import * as XLSX from 'xlsx'; // Uncomment if client-side excel processing is needed

const store = useStore();

const roomOptions = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const searchRoomId = ref('');

const loading = ref(false);
const excelUploadInput = ref(null);
const snackbar = ref({
  show: false,
  message: '',
  color: '',
});

const editedItem = ref({
  room_id: null,
  refrigerator: false,
  washing_machine: false,
  air_conditioner: false,
  induction: false,
  microwave: false,
  tv: false,
  wifi_router: false,
});
const defaultItem = {
  room_id: null,
  refrigerator: false,
  washing_machine: false,
  air_conditioner: false,
  induction: false,
  microwave: false,
  tv: false,
  wifi_router: false,
};

const baseHeaders = [
  { title: '호실 번호', key: 'room.room_number' },
  { title: '냉장고', key: 'refrigerator' },
  { title: '세탁기', key: 'washing_machine' },
  { title: '에어컨', key: 'air_conditioner' },
  { title: '인덕션', key: 'induction' },
  { title: '전자레인지', key: 'microwave' },
  { title: 'TV', key: 'tv' },
  { title: '무선 공유기', key: 'wifi_router' },
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
  return editedIndex.value === -1 ? '새 방 옵션' : '방 옵션 수정';
});

let debounceTimeout = null;
const fetchRoomOptionsDebounced = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(() => {
    fetchRoomOptions();
  }, 300);
};

const fetchRoomOptions = async () => {
  try {
    const params = {};
    if (searchRoomId.value) {
      params.room_id = searchRoomId.value;
    }
    const response = await apiClient.get('/room-options', { params });
    roomOptions.value = response.data;
  } catch (error) {
    console.error('Error fetching room options:', error);
  }
};

// 새로 추가: 호실 목록을 저장할 ref
const rooms = ref([]);

// 새로 추가: 호실 목록을 가져오는 함수
const fetchRooms = async () => {
  try {
    const response = await apiClient.get('/rooms'); // /api/rooms 엔드포인트 사용
    
    // 현재 roomOptions에 있는 room_id들을 Set으로 만듭니다.
    const existingRoomOptionIds = new Set(roomOptions.value.map(option => option.room_id));

    // 중복된 room_id를 가진 객체 제거 및 이미 옵션이 있는 호실 제외
    const uniqueAndAvailableRooms = [];
    const roomIds = new Set(); // fetchRooms 내부의 중복 제거용
    response.data.forEach(room => {
      if (!roomIds.has(room.id) && !existingRoomOptionIds.has(room.id)) {
        uniqueAndAvailableRooms.push(room);
        roomIds.add(room.id);
      }
    });
    rooms.value = uniqueAndAvailableRooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = item ? roomOptions.value.findIndex(option => option.id === item.id) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };

  // 추가된 로그
  console.log('editedItem.room_id:', editedItem.value.room_id, 'Type:', typeof editedItem.value.room_id);
  console.log('Rooms array:', rooms.value);

  // Convert boolean values from backend to be compatible with v-checkbox
  for (const key in editedItem.value) {
    // room_id 필드는 변환 대상에서 제외
    if (key !== 'room_id' && typeof editedItem.value[key] === 'number') {
      editedItem.value[key] = !!editedItem.value[key];
    }
  }

  // 추가: nextTick을 사용하여 v-select 업데이트 강제
  nextTick(() => {
    console.log('nextTick: editedItem.room_id after DOM update:', editedItem.value.room_id);
  });

  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

const saveItem = async () => {
  try {
    // Convert boolean values back to 0 or 1 for backend
    const itemToSave = { ...editedItem.value };
    for (const key in itemToSave) {
      if (typeof itemToSave[key] === 'boolean') {
        itemToSave[key] = itemToSave[key] ? 1 : 0;
      }
    }

    if (editedIndex.value > -1) {
      // Update item
      console.log('itemToSave.id:', itemToSave.id); // 이 로그는 이제 room_id를 확인하는 용도로 변경
      await apiClient.put(`/room-options/${itemToSave.room_id}`, itemToSave); // room_id 사용
    } else {
      // Create new item
      await apiClient.post('/room-options', itemToSave);
    }
    closeDialog();
    fetchRoomOptions(); // Refresh list
    showSnackbar('저장되었습니다.', 'success');
  } catch (error) {
    console.error('Error saving room option:', error.response ? error.response.data : error.message);
    let errorMessage = '저장 중 오류가 발생했습니다.';
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.errors) {
        // errors가 배열일 경우 첫 번째 에러 메시지를 사용하거나 모두 표시
        errorMessage = Array.isArray(error.response.data.errors)
          ? error.response.data.errors.join(', ')
          : error.response.data.errors;
      }
    }
    showSnackbar(errorMessage, 'error');
  }
};

const editItem = (item) => {
  console.log('Editing item:', item);
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/room-options/${item.id}`);
      fetchRoomOptions(); // Refresh list
      showSnackbar('삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Error deleting room option:', error);
      showSnackbar('삭제 중 오류가 발생했습니다.', 'error');
    }
  }
};

const downloadExcelData = async () => {
  loading.value = true;
  try {
    const response = await downloadExcel('/room-options');
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '호실_옵션_목록.xlsx');
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
    await uploadExcel('/room-options', file);
    showSnackbar('엑셀 업로드가 완료되었습니다.', 'success');
    fetchRoomOptions(); // Refresh list after upload
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

onMounted(async () => { // async 추가
  await fetchRoomOptions(); // 먼저 방 옵션 목록을 가져옵니다.
  fetchRooms(); // 그 후에 호실 목록을 가져옵니다.
});
</script>