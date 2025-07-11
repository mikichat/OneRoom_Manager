<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Tenant Management</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Tenants</v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Search by Name, Phone, or Email"
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
                  label="Student Status"
                  clearable
                  density="compact"
                  hide-details
                  variant="outlined"
                  @update:model-value="fetchTenants"
                ></v-select>
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
                  <v-toolbar-title>Tenant List</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isAdmin" color="primary" dark class="mb-2" @click="openDialog()">New Tenant</v-btn>
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
                <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.phone" label="Phone"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.email" label="Email"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.birth_first_six" label="Birth First Six"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.emergency_contact" label="Emergency Contact"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.emergency_name" label="Emergency Name"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-checkbox v-model="editedItem.is_student" label="Is Student"></v-checkbox>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.school_name" label="School Name"></v-text-field>
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
const tenants = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const searchQuery = ref('');
const isStudentFilter = ref(null); // null for all, true for students, false for non-students

const isStudentOptions = [
  { title: 'All', value: null },
  { title: 'Student', value: true },
  { title: 'Not Student', value: false },
];

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
  { title: 'Name', key: 'name' },
  { title: 'Phone', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Is Student', key: 'is_student' },
  { title: 'School Name', key: 'school_name' },
];

const headers = computed(() => {
  if (isAdmin.value) {
    return [...baseHeaders, { title: 'Actions', key: 'actions', sortable: false }];
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
  return editedIndex.value === -1 ? 'New Tenant' : 'Edit Tenant';
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
  } catch (error) {
    console.error('Error saving tenant:', error);
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
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  }
};

onMounted(fetchTenants);
</script>
