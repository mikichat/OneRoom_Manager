<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Monthly Income Report</h1>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedYear"
          :items="availableYears"
          label="Select Year"
          @update:model-value="fetchMonthlyIncomeReport"
          density="compact"
          hide-details
          variant="outlined"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Monthly Income Summary for {{ selectedYear }}</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="monthlyIncomeData"
              :items-per-page="12"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.month="{ item }">
                {{ item.month }}
              </template>
              <template v-slot:item.total_amount="{ item }">
                {{ formatCurrency(item.total_amount) }}
              </template>
              <template v-slot:item.details="{ item }">
                <v-btn icon size="small" variant="text" @click="showPaymentDetails(item.payments)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>Payment Details for {{ selectedMonthDetails }}</v-card-title>
        <v-card-text>
          <v-data-table
            :headers="detailHeaders"
            :items="currentPaymentDetails"
            hide-default-footer
            class="elevation-1"
          >
            <template v-slot:item.payment_date="{ item }">
              {{ new Date(item.payment_date).toLocaleDateString() }}
            </template>
            <template v-slot:item.amount="{ item }">
              {{ formatCurrency(item.amount) }}
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api';

const monthlyIncomeData = ref([]);
const selectedYear = ref(new Date().getFullYear());
const availableYears = ref([]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
};

const detailsDialog = ref(false);
const selectedMonthDetails = ref('');
const currentPaymentDetails = ref([]);

const headers = [
  { title: 'Month', key: 'month' },
  { title: 'Total Amount', key: 'total_amount' },
  { title: 'Details', key: 'details', sortable: false },
];

const detailHeaders = [
  { title: 'Room Number', key: 'room_number' },
  { title: 'Tenant Name', key: 'tenant_name' },
  { title: 'Amount', key: 'amount' },
  { title: 'Payment Date', key: 'payment_date' },
  { title: 'Payment Method', key: 'payment_method' },
  { title: 'Memo', key: 'memo' },
];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    availableYears.value.push(i);
  }
};

const fetchMonthlyIncomeReport = async () => {
  try {
    const response = await apiClient.get(`/reports/monthly-income?year=${selectedYear.value}`);
    monthlyIncomeData.value = response.data;
  } catch (error) {
    console.error('Error fetching monthly income report:', error);
  }
};

const showPaymentDetails = (payments) => {
  currentPaymentDetails.value = payments;
  selectedMonthDetails.value = payments.length > 0 ? new Date(payments[0].payment_date).toLocaleString('default', { month: 'long', year: 'numeric' }) : '';
  detailsDialog.value = true;
};

onMounted(() => {
  generateYears();
  fetchMonthlyIncomeReport();
});
</script> 