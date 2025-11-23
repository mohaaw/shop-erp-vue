import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLocationStore = defineStore('location', () => {
    const locations = ref([
        { id: 1, name: 'Main Office', type: 'office' },
        { id: 2, name: 'Central Warehouse', type: 'warehouse' },
        { id: 3, name: 'Shop 1 (Downtown)', type: 'shop' },
        { id: 4, name: 'Shop 2 (Mall)', type: 'shop' }
    ]);

    const currentLocationId = ref(3); // Default to Shop 1 for POS

    const currentLocation = () => locations.value.find(l => l.id === currentLocationId.value);

    const setLocation = (id) => {
        currentLocationId.value = id;
    };

    return {
        locations,
        currentLocationId,
        currentLocation,
        setLocation
    };
});
