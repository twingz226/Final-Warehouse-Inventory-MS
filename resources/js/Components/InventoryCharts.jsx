import React, { useRef, useState } from 'react';
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
import { ChartBarIcon, PlusIcon, MinusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
    const [zoomLevel, setZoomLevel] = useState(1.0);

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
            setZoomLevel(1.0);

            // Resize chart to reset dimensions
            const resetWidth = Math.max(items.length * 50, 400);
            chartRef.current.resize(resetWidth, 300);

            chartRef.current.resetZoom();
            console.log('Reset zoom executed');
            // Restore scroll position after zoom reset
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    // For reset, we want to center the view
                    const container = scrollContainerRef.current;
                    const totalWidth = Math.max(items.length * 50, 400);
                    const visibleWidth = container.clientWidth;
                    const centerScrollLeft = Math.max(0, (totalWidth - visibleWidth) / 2);
                    scrollContainerRef.current.scrollLeft = centerScrollLeft;
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
            const oldZoomLevel = zoomLevel;
            const newZoomLevel = oldZoomLevel * 1.2;
            setZoomLevel(newZoomLevel);

            // Resize chart to new dimensions
            const newWidth = Math.max(items.length * 50 * newZoomLevel, 400);
            chartRef.current.resize(newWidth, 300);

            console.log('Current scroll position:', scrollLeft);
            console.log('Zoom level:', oldZoomLevel, '->', newZoomLevel);

            // Calculate center of visible area to zoom around current center
            const centerIndex = calculateVisibleCenter();
            const centerX = centerIndex !== null ? chartRef.current.scales.x.getPixelForValue(centerIndex) : chartRef.current.width / 2;
            const center = { x: centerX, y: chartRef.current.height / 2 };

            console.log('Zooming around center:', center);

            // Zoom around the current visible center to prevent view shifting
            chartRef.current.zoom(1.2, 'x', center);
            console.log('Uniform zoom in executed');

            // Wait for zoom to complete and state to update, then adjust scroll position
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    // Calculate proportional scroll adjustment based on zoom level change
                    const oldWidth = Math.max(items.length * 50 * oldZoomLevel, 400);
                    const newWidth = Math.max(items.length * 50 * newZoomLevel, 400);
                    const adjustedScrollLeft = scrollLeft * (newWidth / oldWidth);

                    scrollContainerRef.current.scrollLeft = adjustedScrollLeft;
                    console.log('Scroll position adjusted from', scrollLeft, 'to', adjustedScrollLeft);
                }

                // Check final position
                setTimeout(() => {
                    const finalScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                    console.log('Final scroll position:', finalScrollLeft);
                    console.log('=== ZOOM IN END ===');
                }, 100);
            }, 100);
        } else {
            console.error('Chart ref or zoom method not available');
        }
    };

    const zoomOut = () => {
        console.log('=== ZOOM OUT START ===');
        console.log('Chart ref:', chartRef.current);

        if (chartRef.current && typeof chartRef.current.zoom === 'function') {
            const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
            const oldZoomLevel = zoomLevel;
            const newZoomLevel = oldZoomLevel / 1.2;
            setZoomLevel(newZoomLevel);

            // Resize chart to new dimensions
            const newWidth = Math.max(items.length * 50 * newZoomLevel, 400);
            chartRef.current.resize(newWidth, 300);

            console.log('Current scroll position:', scrollLeft);
            console.log('Zoom level:', oldZoomLevel, '->', newZoomLevel);

            // Calculate center of visible area to zoom around current center
            const centerIndex = calculateVisibleCenter();
            const centerX = centerIndex !== null ? chartRef.current.scales.x.getPixelForValue(centerIndex) : chartRef.current.width / 2;
            const center = { x: centerX, y: chartRef.current.height / 2 };

            console.log('Zooming around center:', center);

            // Zoom around the current visible center to prevent view shifting
            chartRef.current.zoom(0.8, 'x', center);
            console.log('Uniform zoom out executed');

            // Wait for zoom to complete and state to update, then adjust scroll position
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    // Calculate proportional scroll adjustment based on zoom level change
                    const oldWidth = Math.max(items.length * 50 * oldZoomLevel, 400);
                    const newWidth = Math.max(items.length * 50 * newZoomLevel, 400);
                    const adjustedScrollLeft = scrollLeft * (newWidth / oldWidth);

                    scrollContainerRef.current.scrollLeft = adjustedScrollLeft;
                    console.log('Scroll position adjusted from', scrollLeft, 'to', adjustedScrollLeft);
                }

                // Check final position
                setTimeout(() => {
                    const finalScrollLeft = scrollContainerRef.current?.scrollLeft || 0;
                    console.log('Final scroll position:', finalScrollLeft);
                    console.log('=== ZOOM OUT END ===');
                }, 100);
            }, 100);
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
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'x',
                },
                transitions: {
                    zoom: {
                        duration: 0
                    },
                    pan: {
                        duration: 0
                    }
                },
                onZoom: (chart) => {
                    const currentZoomLevel = chart.getZoomLevel();
                    setZoomLevel(currentZoomLevel);
                    // Resize chart to new dimensions after zoom
                    const newWidth = Math.max(items.length * 50 * currentZoomLevel, 400);
                    chart.resize(newWidth, 300);
                },
                onPan: (chart) => {
                    // Update scrollbar position when chart is panned
                    if (scrollContainerRef.current) {
                        const scale = chart.scales.x;
                        const visibleStart = scale.min;
                        const totalItems = items.length;
                        const containerWidth = scrollContainerRef.current.clientWidth;
                        const totalWidth = Math.max(totalItems * 50 * zoomLevel, 400);
                        
                        // Calculate scroll position based on visible start
                        const scrollLeft = (visibleStart / totalItems) * totalWidth;
                        scrollContainerRef.current.scrollLeft = scrollLeft;
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
            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-6">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stock Levels Overview</h3>
                </div>
                <div ref={scrollContainerRef} className="overflow-x-auto">
                    <div style={{ height: '300px', minWidth: `${Math.max(items.length * 50 * zoomLevel, 400)}px` }}>
                        <Bar ref={chartRef} data={stockLevelData} options={barOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryCharts;
