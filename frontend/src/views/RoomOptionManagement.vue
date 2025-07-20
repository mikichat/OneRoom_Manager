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
                  <v-btn color="primary" dark class="mb-2" @click="exportToExcel">엑셀 다운로드</v-btn>
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
                <v-text-field v-model="editedItem.room_id" label="호실 ID" type="number"></v-text-field>
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient from '../api';
import * as XLSX from 'xlsx';

const store = useStore();

const roomOptions = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const searchRoomId = ref('');

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

const openDialog = (item) => {
  editedIndex.value = item ? roomOptions.value.findIndex(option => option.id === item.id) : -1;
  editedItem.value = item ? { ...item } : { ...defaultItem };
  // Convert boolean values from backend to be compatible with v-checkbox
  for (const key in editedItem.value) {
    if (typeof editedItem.value[key] === 'number') {
      editedItem.value[key] = !!editedItem.value[key];
    }
  }
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
      await apiClient.put(`/room-options/${itemToSave.id}`, itemToSave);
    } else {
      // Create new item
      await apiClient.post('/room-options', itemToSave);
    }
    closeDialog();
    fetchRoomOptions(); // Refresh list
  } catch (error) {
    console.error('Error saving room option:', error);
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/room-options/${item.id}`);
      fetchRoomOptions(); // Refresh list
    } catch (error) {
      console.error('Error deleting room option:', error);
    }
  }
};

onMounted(fetchRoomOptions);
</script> 