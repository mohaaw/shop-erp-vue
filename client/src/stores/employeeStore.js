import { defineStore } from 'pinia';

// Mock data for employees since we don't have a real backend for this yet
const MOCK_EMPLOYEES = [
    { id: 'EMP_001', name: 'Admin User', email: 'admin@example.com', role: 'admin', phone: '123-456-7890', status: 'active' },
    { id: 'EMP_002', name: 'John Doe', email: 'john@example.com', role: 'manager', phone: '098-765-4321', status: 'active' },
    { id: 'EMP_003', name: 'Jane Smith', email: 'jane@example.com', role: 'cashier', phone: '555-555-5555', status: 'active' },
];

const LS_EMPLOYEES_KEY = 'shopErpVUE_employees';

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [],
        isLoading: false,
        error: null,
    }),
    getters: {
        getEmployeeById: (state) => (id) => {
            return state.employees.find(e => e.id === id);
        },
        totalEmployees: (state) => state.employees.length,
    },
    actions: {
        _saveToLocalStorage() {
            localStorage.setItem(LS_EMPLOYEES_KEY, JSON.stringify(this.employees));
        },
        async fetchEmployees() {
            this.isLoading = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 150));
                const saved = localStorage.getItem(LS_EMPLOYEES_KEY);
                if (saved) {
                    this.employees = JSON.parse(saved);
                } else {
                    this.employees = MOCK_EMPLOYEES;
                    this._saveToLocalStorage();
                }
            } catch (e) {
                this.error = 'Failed to load employees.';
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
        async addEmployee(employeeData) {
            this.isLoading = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                const newEmployee = {
                    id: `EMP_${Date.now()}`,
                    ...employeeData,
                    createdAt: new Date().toISOString(),
                    status: 'active'
                };
                this.employees.push(newEmployee);
                this._saveToLocalStorage();
                return newEmployee;
            } catch (e) {
                this.error = 'Failed to add employee.';
                throw e;
            } finally {
                this.isLoading = false;
            }
        },
        async updateEmployee(id, updates) {
            this.isLoading = true;
            try {
                const index = this.employees.findIndex(e => e.id === id);
                if (index !== -1) {
                    this.employees[index] = { ...this.employees[index], ...updates };
                    this._saveToLocalStorage();
                    return this.employees[index];
                }
                throw new Error('Employee not found');
            } catch (e) {
                this.error = 'Failed to update employee.';
                throw e;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteEmployee(id) {
            this.isLoading = true;
            try {
                this.employees = this.employees.filter(e => e.id !== id);
                this._saveToLocalStorage();
            } catch (e) {
                this.error = 'Failed to delete employee';
                throw e;
            } finally {
                this.isLoading = false;
            }
        }
    },
});
