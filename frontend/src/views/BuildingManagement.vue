<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">건물 관리</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>건물 목록</v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="이름 또는 주소로 검색"
                  clearable
                  density="compact"
                  hide-details
                  variant="outlined"
                  @input="fetchBuildingsDebounced"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-data-table
              :headers="filteredHeaders"
              :items="buildings"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>건물</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">새 건물</v-btn>
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
              <v-col cols="12">
                <v-text-field v-model="editedItem.name" label="건물 이름"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.address" label="주소"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.total_floors" label="총 층수" type="number"></v-text-field>
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

const store = useStore();
const buildings = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const searchQuery = ref('');

const editedItem = ref({
  name: '',
  address: '',
  total_floors: 1,
});
const defaultItem = {
  name: '',
  address: '',
  total_floors: 1,
};

const baseHeaders = [
  { title: '이름', key: 'name' },
  { title: '주소', key: 'address' },
  { title: '총 층수', key: 'total_floors' },
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
  return editedIndex.value === -1 ? '새 건물' : '건물 수정';
});

let debounceTimeout = null;
const fetchBuildingsDebounced = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(() => {
    fetchBuildings();
  }, 300);
};

const fetchBuildings = async () => {
  try {
    const params = {};
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    const response = await apiClient.get('/buildings', { params });
    buildings.value = response.data;
  } catch (error) {
    console.error('Error fetching buildings:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = buildings.value.indexOf(item);
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
      await apiClient.put(`/buildings/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create new item
      await apiClient.post('/buildings', editedItem.value);
    }
    closeDialog();
    fetchBuildings(); // Refresh list
  } catch (error) {
    console.error('Error saving building:', error);
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/buildings/${item.id}`);
      fetchBuildings(); // Refresh list
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  }
};

const exportToExcel = () => {
  const data = buildings.value.map(building => ({
    이름: building.name,
    주소: building.address,
    총층수: building.total_floors,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '건물 목록');
  XLSX.writeFile(wb, '건물_목록.xlsx');
};

onMounted(fetchBuildings);
</script> 