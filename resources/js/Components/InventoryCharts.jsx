import React, { useRef } from 'react';
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
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    zoomPlugin
);

const InventoryCharts = ({ items, summary }) => {
    const chartRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Calculate center point of currently visible chart area
    const calculateVisibleCenter = () => {
        if (!scrollContainerRef.current || !chartRef.current) return null;

        const container = scrollContainerRef.current;
        const chart = chartRef.current;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const totalWidth = container.scrollWidth;

        // Calculate visible portion as percentage
        const visibleStartPercent = scrollLeft / totalWidth;
        const visibleEndPercent = (scrollLeft + containerWidth) / totalWidth;

        // Convert to data indices
        const dataLength = stockLevelData.labels.length;
        const startIndex = Math.floor(visibleStartPercent * dataLength);
        const endIndex = Math.ceil(visibleEndPercent * dataLength);
        const centerIndex = Math.floor((startIndex + endIndex) / 2);

        // Clamp to valid range
        const clampedIndex = Math.max(0, Math.min(centerIndex, dataLength - 1));

        return clampedIndex;
    };

    const resetZoom = () => {
        console.log('Reset zoom called, chartRef:', chartRef.current);
        if (chartRef.current && typeof chartRef.current.resetZoom === 'function') {
            const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
            chartRef.current.resetZoom();
            console.log('Reset zoom executed');
            // Restore scroll position after zoom
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = scrollLeft;
                }
            }, 50);
        } else {
            console.error('Chart ref or resetZoom method not available');
        }
    };

    const zoomIn = () => {
        console.log('=== ZOOM IN START ===');
        console.log('Chart ref:', chartRef.current);
        console.log('Scroll container:', scrollContainerRef.current);

        if (chartRef.current && typeof chartRef.current.zoom === 'function') {
            const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;

            console.log('Current scroll position:', scrollLeft);

            // Use uniform zoom without center point to avoid automatic centering
            chartRef.current.zoom(1.2);
            console.log('Uniform zoom in executed');

            // Check scroll position immediately after zoom
            setTimeout(() => {
                const newScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                console.log('Scroll position after zoom (before restoration):', newScrollLeft);

                // Restore scroll position
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = scrollLeft;
                    console.log('Scroll position restored to:', scrollLeft);
                }

                // Check final position
                setTimeout(() => {
                    const finalScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                    console.log('Final scroll position:', finalScrollLeft);
                    console.log('=== ZOOM IN END ===');
                }, 100);
            }, 100); // Increased delay
        } else {
            console.error('Chart ref or zoom method not available');
        }
    };

    const zoomOut = () => {
        console.log('=== ZOOM OUT START ===');
        console.log('Chart ref:', chartRef.current);

        if (chartRef.current && typeof chartRef.current.zoom === 'function') {
            const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;

            console.log('Current scroll position:', scrollLeft);

            // Use uniform zoom without center point
            chartRef.current.zoom(0.8);
            console.log('Uniform zoom out executed');

            // Check scroll position after zoom
            setTimeout(() => {
                const newScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                console.log('Scroll position after zoom (before restoration):', newScrollLeft);

                // Restore scroll position
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = scrollLeft;
                    console.log('Scroll position restored to:', scrollLeft);
                }

                // Check final position
                setTimeout(() => {
                    const finalScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                    console.log('Final scroll position:', finalScrollLeft);
                    console.log('=== ZOOM OUT END ===');
                }, 100);
            }, 100); // Increased delay
        } else {
            console.error('Chart ref or zoom method not available');
        }
    };
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
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                },
                zoom: {
                    wheel: {
                        enabled: false,
                    },
                    pinch: {
                        enabled: false,
                    },
                    mode: 'x',
                    // Disable programmatic zoom to prevent data displacement
                    enabled: false,
                },
                // Disable transitions to prevent movement
                transitions: {
                    zoom: {
                        duration: 0
                    },
                    pan: {
                        duration: 0
                    }
                }
            },
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
            {/* Stock Levels Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div ref={scrollContainerRef} style={{ overflowX: 'auto' }}>
                    <div style={{ height: '300px', minWidth: `${Math.max(items.length * 50, 400)}px` }}>
                        <Bar ref={chartRef} data={stockLevelData} options={barOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryCharts;
