import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
);

const InventoryCharts = ({ items, summary }) => {
    // Prepare data for category distribution pie chart
    const categoryData = {
        labels: ['Tools', 'Materials'],
        datasets: [
            {
                label: 'Items by Category',
                data: [summary.total_tools, summary.total_materials],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // Blue for tools
                    'rgba(34, 197, 94, 0.8)',   // Green for materials
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for stock levels bar chart
    const stockLevelData = {
        labels: items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
        datasets: [
            {
                label: 'Total Stock',
                data: items.map(item => item.total_stock),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
            },
            {
                label: 'Available Stock',
                data: items.map(item => item.available_stock),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
            },
            {
                label: 'Distributed',
                data: items.map(item => item.total_distributed),
                backgroundColor: 'rgba(251, 146, 60, 0.8)',
                borderColor: 'rgba(251, 146, 60, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for low stock items
    const lowStockItems = items.filter(item => item.available_stock <= 10);
    const lowStockData = {
        labels: lowStockItems.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
        datasets: [
            {
                label: 'Available Stock',
                data: lowStockItems.map(item => item.available_stock),
                backgroundColor: lowStockItems.map(item =>
                    item.available_stock === 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 146, 60, 0.8)'
                ),
                borderColor: lowStockItems.map(item =>
                    item.available_stock === 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(251, 146, 60, 1)'
                ),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Inventory Overview',
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Category Distribution',
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Stock Levels by Item',
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        },
    };

    const lowStockOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Low Stock Items (≤5 units)',
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        },
    };

    return (
        <div className="mb-6">
            {/* Category Distribution Pie Chart - New Section */}
            <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div style={{ height: '300px' }}>
                        <Pie data={categoryData} options={pieOptions} />
                    </div>
                </div>
            </div>

            {/* Stock Levels Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ height: '300px', minWidth: `${Math.max(items.length * 80, 400)}px` }}>
                        <Bar data={stockLevelData} options={barOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryCharts;
