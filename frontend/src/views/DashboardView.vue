<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Dashboard</h1>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="d-flex flex-column align-center justify-center pa-4 text-center">
          <v-icon size="60" color="blue">mdi-home-city</v-icon>
          <v-card-title class="text-h5 mt-2">Room Status</v-card-title>
          <v-card-text>
            <p class="text-h6">Total: {{ dashboardSummary.totalRooms }}</p>
            <p class="text-h6">Rented: {{ dashboardSummary.rentedRooms }}</p>
            <p class="text-h6">Available: {{ dashboardSummary.availableRooms }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="d-flex flex-column align-center justify-center pa-4 text-center">
          <v-icon size="60" color="green">mdi-cash-multiple</v-icon>
          <v-card-title class="text-h5 mt-2">Monthly Revenue</v-card-title>
          <v-card-text>
            <p class="text-h4 font-weight-bold">{{ formatCurrency(dashboardSummary.paidThisMonth) }}</p>
            <p class="text-subtitle-1">Paid This Month</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center"><v-icon left>mdi-calendar-alert</v-icon> Expiring Contracts (Next Month)</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="contract in dashboardSummary.expiringContracts" :key="contract.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ contract.room.room_number }} - {{ contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>Ends: {{ formatDate(contract.contract_end_date) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.expiringContracts && dashboardSummary.expiringContracts.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-caption">No expiring contracts next month.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center"><v-icon left>mdi-alert-octagon</v-icon> Overdue Payments</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="payment in dashboardSummary.overduePayments" :key="payment.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ payment.contract.room.room_number }} - {{ payment.contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>Due: {{ formatDate(payment.due_date) }} - Amount: {{ formatCurrency(payment.amount) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.overduePayments && dashboardSummary.overduePayments.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-caption">No overdue payments.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center"><v-icon left>mdi-clock-outline</v-icon> Upcoming Payments</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="payment in dashboardSummary.upcomingPayments" :key="payment.id">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ payment.contract.room.room_number }} - {{ payment.contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>Due: {{ formatDate(payment.due_date) }} - Amount: {{ formatCurrency(payment.amount) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.upcomingPayments && dashboardSummary.upcomingPayments.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-caption">No upcoming payments.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>Monthly Income (Last 12 Months)</v-card-title>
          <v-card-text>
            <div style="height: 400px">
              <Bar :data="chartData" :options="chartOptions" v-if="chartData.datasets.length > 0" />
              <p v-else>No monthly income data available.</p>
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
</script>
