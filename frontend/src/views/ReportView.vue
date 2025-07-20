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

      <v-col cols="12">
        <v-card>
          <v-card-title>Monthly Income Chart</v-card-title>
          <v-card-text>
            <Bar
              v-if="chartData.labels.length"
              :data="chartData"
              :options="chartOptions"
            />
            <v-card-text v-else>No chart data available for this year.</v-card-text>
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
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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

const chartData = computed(() => {
  const labels = monthlyIncomeData.value.map(data => data.month);
  const data = monthlyIncomeData.value.map(data => data.total_amount);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Monthly Income',
        backgroundColor: '#42A5F5',
        data: data,
      },
    ],
  };
});

const chartOptions = { // 차트 옵션 정의
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Amount (KRW)',
      },
      ticks: {
        callback: function(value) {
          return formatCurrency(value);
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Month',
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += formatCurrency(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
};

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