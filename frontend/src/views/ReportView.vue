<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">월별 수입 보고서</h1>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedYear"
          :items="availableYears"
          label="년도 선택"
          @update:model-value="fetchMonthlyIncomeReport"
          density="compact"
          hide-details
          variant="outlined"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>{{ selectedYear }}년 월별 수입 요약</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="monthlyIncomeData"
              :items-per-page="12"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.month="{ item }">
                {{ item.month }}월
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
          <v-card-title>월별 수입 차트</v-card-title>
          <v-card-text>
            <Bar
              v-if="chartData.labels.length"
              :data="chartData"
              :options="chartOptions"
            />
            <v-card-text v-else>해당 년도에는 차트 데이터가 없습니다.</v-card-text>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>{{ selectedMonthDetails }} 지불 내역</v-card-title>
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
          <v-btn color="blue darken-1" text @click="detailsDialog = false">닫기</v-btn>
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
  { title: '월', key: 'month' },
  { title: '총 수입', key: 'total_amount' },
  { title: '세부 정보', key: 'details', sortable: false },
];

const detailHeaders = [
  { title: '호실', key: 'room_number' },
  { title: '임차인 이름', key: 'tenant_name' },
  { title: '금액', key: 'amount' },
  { title: '지불일', key: 'payment_date' },
  { title: '지불 방법', key: 'payment_method' },
  { title: '메모', key: 'memo' },
];

const chartData = computed(() => {
  const labels = monthlyIncomeData.value.map(data => data.month);
  const data = monthlyIncomeData.value.map(data => data.total_amount);

  return {
    labels: labels,
    datasets: [
      {
        label: '월별 수입',
        backgroundColor: '#42A5F5',
        data: data,
      },
    ],
  };
});

const chartOptions = { 
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '금액 (KRW)',
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
        text: '월',
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
  selectedMonthDetails.value = payments.length > 0 ? new Date(payments[0].payment_date).toLocaleString('ko-KR', { month: 'long', year: 'numeric' }) : '';
  detailsDialog.value = true;
};

onMounted(() => {
  generateYears();
  fetchMonthlyIncomeReport();
});
</script> 