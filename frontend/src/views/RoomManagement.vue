<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Room Management</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Rooms</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="filteredHeaders"
              :items="rooms"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Room List</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">New Room</v-btn>
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
                <v-text-field v-model="editedItem.building_id" label="Building ID"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.room_number" label="Room Number"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.floor" label="Floor"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.room_type"
                  :items="['1룸', '2룸']"
                  label="Room Type"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.area" label="Area"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.monthly_rent" label="Monthly Rent"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.deposit" label="Deposit"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.status"
                  :items="['임대가능', '임대중', '수리중']"
                  label="Status"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.description" label="Description"></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex'; // useStore import 추가
import apiClient from '../api';

const store = useStore(); // store 초기화

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

const baseHeaders = [
  { title: 'Building ID', key: 'building_id' },
  { title: 'Room Number', key: 'room_number' },
  { title: 'Floor', key: 'floor' },
  { title: 'Room Type', key: 'room_type' },
  { title: 'Area', key: 'area' },
  { title: 'Monthly Rent', key: 'monthly_rent' },
  { title: 'Deposit', key: 'deposit' },
  { title: 'Status', key: 'status' },
];

const filteredHeaders = computed(() => {
  if (isAdmin.value) {
    return [...baseHeaders, { title: 'Actions', key: 'actions', sortable: false }];
  } else {
    return baseHeaders;
  }
});

const isAdmin = computed(() => {
  return store.state.auth.user && store.state.auth.user.role === 'admin';
});

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Room' : 'Edit Room';
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
  } catch (error) {
    console.error('Error saving room:', error);
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
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  }
};

onMounted(fetchRooms);
</script>
