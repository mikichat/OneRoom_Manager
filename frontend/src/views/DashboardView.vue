<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">Dashboard</h1>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Room Status</v-card-title>
          <v-card-text>
            <p>Total Rooms: {{ dashboardSummary.totalRooms }}</p>
            <p>Rented Rooms: {{ dashboardSummary.rentedRooms }}</p>
            <p>Available Rooms: {{ dashboardSummary.availableRooms }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Monthly Revenue</v-card-title>
          <v-card-text>
            <p>Paid This Month: {{ dashboardSummary.paidThisMonth }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Expiring Contracts (Next Month)</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="contract in dashboardSummary.expiringContracts" :key="contract.id">
                <v-list-item-content>
                  <v-list-item-title>{{ contract.room.room_number }} - {{ contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>Ends: {{ new Date(contract.contract_end_date).toLocaleDateString() }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.expiringContracts && dashboardSummary.expiringContracts.length === 0">
                <v-list-item-content>
                  <v-list-item-title>No expiring contracts next month.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>Overdue Payments</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="payment in dashboardSummary.overduePayments" :key="payment.id">
                <v-list-item-content>
                  <v-list-item-title>{{ payment.contract.room.room_number }} - {{ payment.contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>Due: {{ new Date(payment.due_date).toLocaleDateString() }} - Amount: {{ payment.amount }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.overduePayments && dashboardSummary.overduePayments.length === 0">
                <v-list-item-content>
                  <v-list-item-title>No overdue payments.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>Upcoming Payments</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="payment in dashboardSummary.upcomingPayments" :key="payment.id">
                <v-list-item-content>
                  <v-list-item-title>{{ payment.contract.room.room_number }} - {{ payment.contract.tenant.name }}</v-list-item-title>
                  <v-list-item-subtitle>Due: {{ new Date(payment.due_date).toLocaleDateString() }} - Amount: {{ payment.amount }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.upcomingPayments && dashboardSummary.upcomingPayments.length === 0">
                <v-list-item-content>
                  <v-list-item-title>No upcoming payments.</v-list-item-title>
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
            <v-list dense>
              <v-list-item v-for="monthData in dashboardSummary.monthlyIncome" :key="monthData.month">
                <v-list-item-content>
                  <v-list-item-title>{{ monthData.month }}: {{ monthData.total_amount }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="dashboardSummary.monthlyIncome && dashboardSummary.monthlyIncome.length === 0">
                <v-list-item-content>
                  <v-list-item-title>No monthly income data available.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <!-- Chart will go here -->
            <!-- <canvas ref="monthlyIncomeChart"></canvas> -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api';

const dashboardSummary = ref({
  totalRooms: 0,
  rentedRooms: 0,
  availableRooms: 0,
  paidThisMonth: 0,
  expiringContracts: [],
  overduePayments: [],
  upcomingPayments: [], // 추가된 부분
  monthlyIncome: [],     // 추가된 부분
});

const fetchDashboardSummary = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    dashboardSummary.value = response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
  }
};

onMounted(fetchDashboardSummary);
</script>
