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
            <v-data-table
              :headers="headers"
              :items="tenants"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Tenant List</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" dark class="mb-2" @click="openDialog()">New Tenant</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
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
import axios from 'axios';

const tenants = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
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

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Phone', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Is Student', key: 'is_student' },
  { title: 'School Name', key: 'school_name' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Tenant' : 'Edit Tenant';
});

const fetchTenants = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/tenants');
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
      await axios.put(`http://localhost:3000/api/tenants/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create new item
      await axios.post('http://localhost:3000/api/tenants', editedItem.value);
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
      await axios.delete(`http://localhost:3000/api/tenants/${item.id}`);
      fetchTenants(); // Refresh list
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  }
};

onMounted(fetchTenants);
</script>
