<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">대시보드</h1>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="d-flex flex-column align-center justify-center pa-4 text-center">
          <v-icon size="60" color="blue">mdi-home-city</v-icon>
          <v-card-title class="text-h5 mt-2">호실 현황</v-card-title>
          <v-card-text>
            <p class="text-h6">전체: {{ dashboardSummary.totalRooms }}</p>
            <p class="text-h6">임대중: {{ dashboardSummary.rentedRooms }}</p>
            <p class="text-h6">공실: {{ dashboardSummary.availableRooms }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="d-flex flex-column align-center justify-center pa-4 text-center">
          <v-icon size="60" color="green">mdi-cash-multiple</v-icon>
          <v-card-title class="text-h5 mt-2">이번 달 수입</v-card-title>
          <v-card-text>
            <p class="text-h4 font-weight-bold">{{ formatCurrency(dashboardSummary.paidThisMonth) }}</p>
            <p class="text-subtitle-1">이번 달 납부 완료 금액</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center"><v-icon left>mdi-calendar-alert</v-icon> 계약 만료 예정 (다음 달)</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="contract in dashboardSummary.expiringContracts" :key="contract.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ contract.room.room_number }} - {{ contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>만료일: {{ formatDate(contract.contract_end_date) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.expiringContracts && dashboardSummary.expiringContracts.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-caption">다음 달에 만료되는 계약이 없습니다.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center"><v-icon left>mdi-alert-octagon</v-icon> 연체된 납부</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="payment in dashboardSummary.overduePayments" :key="payment.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ payment.contract.room.room_number }} - {{ payment.contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>납부기한: {{ formatDate(payment.due_date) }} - 금액: {{ formatCurrency(payment.amount) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.overduePayments && dashboardSummary.overduePayments.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-caption">연체된 납부 내역이 없습니다.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center"><v-icon left>mdi-clock-outline</v-icon> 예정된 납부</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="payment in dashboardSummary.upcomingPayments" :key="payment.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ payment.contract.room.room_number }} - {{ payment.contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>납부기한: {{ formatDate(payment.due_date) }} - 금액: {{ formatCurrency(payment.amount) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.upcomingPayments && dashboardSummary.upcomingPayments.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-caption">예정된 납부 내역이 없습니다.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>월별 수입 (지난 12개월)</v-card-title>
          <v-card-text>
            <div style="height: 400px">
              <Bar :data="chartData" :options="chartOptions" v-if="chartData.datasets.length > 0" />
              <p v-else>월별 수입 데이터가 없습니다.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const dashboardSummary = ref({
  totalRooms: 0,
  rentedRooms: 0,
  availableRooms: 0,
  paidThisMonth: 0,
  expiringContracts: [],
  overduePayments: [],
  upcomingPayments: [],
  monthlyIncome: [],
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₩0';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchDashboardSummary = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    dashboardSummary.value = response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
  }
};

onMounted(fetchDashboardSummary);

const chartData = computed(() => {
  if (!dashboardSummary.value.monthlyIncome || dashboardSummary.value.monthlyIncome.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }
  const labels = dashboardSummary.value.monthlyIncome.map(item => item.month);
  const data = dashboardSummary.value.monthlyIncome.map(item => item.total_amount);

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

const chartOptions = { // 차트 옵션 정의
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '금액 (원)',
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
</script>
