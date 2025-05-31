<template>
  <div class="sales-report-by-period-component card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Sales Report by Period</span>
      <button
        v-if="reportData.generated && reportData.sales.length > 0"
        @click="printReport"
        class="btn btn-sm btn-outline-secondary no-print"
      >
        🖨️ Print Report
      </button>
    </div>
    <div class="card-body">
      <div class="filter-section form-grid-3 mb-3 no-print">
        <div class="form-group">
          <label for="report-start-date">Start Date:</label>
          <input type="date" id="report-start-date" class="form-control form-control-sm" v-model="startDate">
        </div>
        <div class="form-group">
          <label for="report-end-date">End Date:</label>
          <input type="date" id="report-end-date" class="form-control form-control-sm" v-model="endDate">
        </div>
        <div class="form-group" style="align-self: flex-end;">
          <button class="btn btn-primary btn-sm" @click="generateReport" :disabled="isLoadingReport">
            <span v-if="isLoadingReport"><div class="loader-btn-inline"></div> Generating...</span>
            <span v-else>Generate Report</span>
          </button>
        </div>
      </div>

      <div ref="reportPrintContent">
        <div v-if="reportData.generated">
          <div class="print-header print-only" style="display:none; text-align:center; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-family-serif); margin-bottom: 0.25rem;">{{ settingsStore.storeName }}</h3>
            <h4 class="report-title-print" style="margin-bottom: 0.25rem;">Sales Report</h4>
            <p style="font-size:0.9em;">Period: {{ formatDate(reportData.reportStartDate) }} to {{ formatDate(reportData.reportEndDate) }}</p>
            <p style="font-size:0.8em;">Generated: {{ new Date().toLocaleString() }}</p>
          </div>
          <h4 class="mt-3 report-title-screen no-print">Report for Period: {{ formatDate(reportData.reportStartDate) }} to {{ formatDate(reportData.reportEndDate) }}</h4>

          <div class="summary-metrics form-grid-3 mt-3 mb-3">
            <div class="metric-item card card-body">
              <strong>Total Sales Records:</strong> {{ reportData.totalSalesCount }}
            </div>
            <div class="metric-item card card-body">
              <strong>Total Revenue:</strong> {{ settingsStore.currencySymbol }}{{ reportData.totalRevenue.toFixed(2) }}
            </div>
            <div class="metric-item card card-body">
              <strong>Total Profit (Est.):</strong>
              <span :class="reportData.totalProfit >= 0 ? 'text-success' : 'text-danger'">
                      {{ settingsStore.currencySymbol }}{{ reportData.totalProfit.toFixed(2) }}
                  </span>
            </div>
          </div>

          <div class="table-responsive mt-3" v-if="reportData.sales.length > 0">
            <table class="table table-sm table-hover">
              <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items Qty</th>
                <th>Total ({{ settingsStore.currencySymbol }})</th>
                <th>Profit (Est. {{ settingsStore.currencySymbol }})</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="sale in reportData.sales" :key="sale.id">
                <td>...{{ sale.id.slice(-8) }}</td>
                <td>{{ new Date(sale.date).toLocaleString() }}</td>
                <td>{{ sale.customerName || 'Anonymous' }}</td>
                <td>{{ sale.items.reduce((sum, item) => sum + item.quantity, 0) }}</td>
                <td style="font-weight: bold;">{{ settingsStore.currencySymbol }}{{ sale.totalAmount.toFixed(2) }}</td>
                <td :class="sale.estimatedProfit >= 0 ? 'text-success' : 'text-danger'">
                  {{ settingsStore.currencySymbol }}{{ sale.estimatedProfit.toFixed(2) }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-muted text-center mt-3">No sales found for the selected period.</p>
        </div>
      </div>

      <p v-if="!reportData.initialReportGenerated && !salesStore.isLoading" class="text-muted text-center mt-3">
        Select a date range and click "Generate Report".
      </p>
      <div v-if="salesStore.isLoading && !reportData.initialReportGenerated" class="text-center mt-3">
        <div class="loader"></div> Loading initial sales data...
      </div>
      <div v-if="salesStore.error && !reportData.generated" class="form-alert alert-danger mt-3">
        Error loading sales data: {{ salesStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSalesStore } from '@/stores/salesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const salesStore = useSalesStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 6);

const startDate = ref(sevenDaysAgo.toISOString().split('T')[0]);
const endDate = ref(today.toISOString().split('T')[0]);
const isLoadingReport = ref(false);
const reportPrintContent = ref(null);

const reportData = reactive({
  generated: false,
  initialReportGenerated: false,
  sales: [],
  totalSalesCount: 0,
  totalRevenue: 0,
  totalProfit: 0,
  reportStartDate: '',
  reportEndDate: '',
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
};

const generateReport = async () => {
  if (!startDate.value || !endDate.value) {
    toastStore.error("Please select both a start and end date.");
    return;
  }
  if (new Date(startDate.value) > new Date(endDate.value)) {
    toastStore.error("Start date cannot be after end date.");
    return;
  }

  isLoadingReport.value = true;
  reportData.initialReportGenerated = true;
  reportData.generated = false;

  // Ensure sales data is fetched if not already available
  // This check is important because the ReportsPage might have already fetched it.
  if (salesStore.sales.length === 0 && !salesStore.isLoading && !salesStore.error) {
    console.log("SalesReportByPeriod: Sales store empty, fetching...");
    await salesStore.fetchSales();
  }

  const filtered = salesStore.getSalesInDateRange(startDate.value, endDate.value);

  reportData.sales = filtered;
  reportData.totalSalesCount = filtered.length;
  reportData.totalRevenue = filtered.reduce((sum, sale) => sum + sale.totalAmount, 0);
  reportData.totalProfit = filtered.reduce((sum, sale) => sum + (sale.estimatedProfit || 0), 0);
  reportData.reportStartDate = startDate.value;
  reportData.reportEndDate = endDate.value;
  reportData.generated = true;
  isLoadingReport.value = false;

  if (filtered.length === 0 && reportData.generated) { // Added reportData.generated to ensure this toast only shows after an attempt
    toastStore.info("No sales found for the selected period.", 3000);
  }
};

const printReport = () => {
  if (reportPrintContent.value) {
    const printWindow = window.open('', '_blank', 'height=700,width=1000');
    if(printWindow) {
      printWindow.document.write('<html><head><title>Sales Report</title>');
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch (e) {
            if (styleSheet.href) return `<link rel="stylesheet" href="${styleSheet.href}">`;
            return '';
          }
        }).join('\n');

      printWindow.document.write(`<style>${styles}</style>`);
      // More specific print styles
      printWindow.document.write('<style>.no-print{display:none !important;} .print-only{display:block !important;} .report-title-print{text-align:center; margin-bottom:0.2rem; font-size: 14pt;} .report-title-screen{display:none;} .summary-metrics .metric-item{border:1px solid #eee; margin-bottom:0.5rem; background-color: #fff !important; color: #000 !important;} .summary-metrics .metric-item strong{color: #333 !important;} table{font-size:9pt} body{background-color: #fff !important; color: #000 !important; font-family: Arial, sans-serif;} .store-name-print{display:block !important; text-align:center; font-weight:bold; margin-bottom: 0.5rem;} .date-print{display:block !important; text-align:center; font-size:0.9em; margin-bottom:0.5rem;} .text-success{color: green !important;} .text-danger{color: red !important;}</style>');
      printWindow.document.write('</head><body style="margin: 20px;">');
      printWindow.document.write(reportPrintContent.value.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 500);
    } else {
      toastStore.error("Could not open print window. Please check pop-up blocker settings.", 4000);
    }
  }
};

onMounted(async () => {
  // Data fetching is primarily handled by ReportsPage.vue or when generateReport is called.
  // This ensures data is available if this component is ever used standalone or if ReportsPage fails.
  if (salesStore.sales.length === 0 && !salesStore.isLoading && !salesStore.error) {
    isLoadingReport.value = true; // Show loading for initial data fetch if directly landing here
    await salesStore.fetchSales();
    isLoadingReport.value = false;
  }
});
</script>

<style scoped>
.filter-section .form-group { margin-bottom: 0; }
.summary-metrics .metric-item {
  padding: var(--space-md); text-align: center; font-size: 0.95rem;
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-sm);
}
.summary-metrics .metric-item strong {
  display: block; font-size: 0.85rem; color: var(--text-color-muted);
  margin-bottom: var(--space-xs);
}
.table-sm th, .table-sm td { padding: var(--space-sm) var(--space-md); }
.text-success { color: var(--success-color) !important; }
.text-danger { color: var(--danger-color) !important; }
.text-muted { color: var(--text-color-muted); }
.loader { width: 24px; height: 24px; border-width: 3px; margin: 0 auto var(--space-sm) auto; }
.form-control-sm { padding: 0.5rem 0.75rem; font-size: 0.9rem; height: auto; }
.loader-btn-inline { width: 1em; height: 1em; border-width: 2px; border-style: solid; border-color: currentColor currentColor currentColor transparent; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 0.5em; animation: spin 0.6s linear infinite; }
.btn-primary .loader-btn-inline { border-left-color: var(--text-on-primary); border-bottom-color: var(--text-on-primary); }
.btn-outline-secondary {
  color: var(--secondary-color); border-color: var(--secondary-color);
}
.btn-outline-secondary:hover {
  color: var(--text-color-inverted); background-color: var(--secondary-color); border-color: var(--secondary-color);
}
[data-theme="dark"] .btn-outline-secondary { color: var(--nav-text-color); border-color: var(--nav-text-color); }
[data-theme="dark"] .btn-outline-secondary:hover { color: var(--bg-color); background-color: var(--nav-text-color); }
.report-title-screen { /* Screen only title */ }
.form-alert.alert-danger { /* Ensure this style is available if errors are shown */
  color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb;
  padding: var(--space-md); border: 1px solid transparent; border-radius: var(--border-radius);
}
[data-theme="dark"] .form-alert.alert-danger { background-color: #52262a; border-color: #8B3A3F; color: #ffacac;}
</style>
