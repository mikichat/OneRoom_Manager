<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Contract Management</h1>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Contracts</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="contracts"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Contract List</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" dark class="mb-2" @click="openDialog()">New Contract</v-btn>
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
                <v-text-field v-model="editedItem.room_id" label="Room ID"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.tenant_id" label="Tenant ID"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.contract_start_date" label="Contract Start Date" type="date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.contract_end_date" label="Contract End Date" type="date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.monthly_rent" label="Monthly Rent"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="editedItem.deposit" label="Deposit"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-file-input v-model="contractImage" label="Contract Image" prepend-icon="mdi-paperclip"></v-file-input>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.contract_status"
                  :items="['활성', '만료', '해지']"
                  label="Contract Status"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.special_terms" label="Special Terms"></v-textarea>
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
import apiClient from '../api';

const contracts = ref([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const contractImage = ref(null);
const editedItem = ref({
  room_id: '',
  tenant_id: '',
  contract_start_date: '',
  contract_end_date: '',
  monthly_rent: '',
  deposit: '',
  contract_image_path: '',
  contract_status: '',
  special_terms: '',
});
const defaultItem = {
  room_id: '',
  tenant_id: '',
  contract_start_date: '',
  contract_end_date: '',
  monthly_rent: '',
  deposit: '',
  contract_image_path: '',
  contract_status: '',
  special_terms: '',
};

const headers = [
  { title: 'Room ID', key: 'room_id' },
  { title: 'Tenant ID', key: 'tenant_id' },
  { title: 'Start Date', key: 'contract_start_date' },
  { title: 'End Date', key: 'contract_end_date' },
  { title: 'Monthly Rent', key: 'monthly_rent' },
  { title: 'Status', key: 'contract_status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Contract' : 'Edit Contract';
});

const fetchContracts = async () => {
  try {
    const response = await apiClient.get('/contracts');
    contracts.value = response.data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
  }
};

const openDialog = (item) => {
  editedIndex.value = contracts.value.indexOf(item);
  editedItem.value = item ? { ...item } : { ...defaultItem };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  contractImage.value = null;
};

const saveItem = async () => {
  try {
    const formData = new FormData();
    for (const key in editedItem.value) {
      if (key !== 'contract_image_path') { // Exclude path as it's handled by file upload
        formData.append(key, editedItem.value[key]);
      }
    }
    if (contractImage.value) {
      formData.append('contract_image', contractImage.value[0]);
    }

    if (editedIndex.value > -1) {
      // Update item
      await apiClient.put(`/contracts/${editedItem.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Create new item
      await apiClient.post('/contracts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    closeDialog();
    fetchContracts(); // Refresh list
  } catch (error) {
    console.error('Error saving contract:', error);
  }
};

const editItem = (item) => {
  openDialog(item);
};

const deleteItem = async (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await apiClient.delete(`/contracts/${item.id}`);
      fetchContracts(); // Refresh list
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  }
};

onMounted(fetchContracts);
</script>
