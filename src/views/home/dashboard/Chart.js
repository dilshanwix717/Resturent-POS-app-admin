import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import newRequest from '../../../utils/newRequest';
import { format, parseISO, startOfMonth, isValid, subMonths } from 'date-fns'; // Import subMonths

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Chart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const oneMonthAgo = subMonths(new Date(), 1); // 1 month ago
        const formattedFromDate = format(oneMonthAgo, 'yyyy-MM-dd');
        const formattedToDate = format(new Date(), 'yyyy-MM-dd');

        console.log('Fetching data from:', formattedFromDate, 'to', formattedToDate);

        const response = await newRequest.get(`/orders/Sales/${formattedFromDate}/${formattedToDate}`);
        const salesData = response.data.salesDetails;

        // Check the format of item.date
        salesData.forEach(item => {
          console.log('Original date:', item.date);
        });

        // Prepare the data for the chart
        const labels = salesData.map(item => {
          try {
            if (item.date) {
              const date = parseISO(item.date); // Parse date
              if (isValid(date)) { // Check if date is valid
                const monthStart = startOfMonth(date); // Start of the month
                return format(monthStart, 'dd-MM-yyyy'); // Format month start date
              }
            }
            console.warn('Invalid or missing date:', item.date);
            return ''; // Default value in case of error
          } catch (error) {
            console.error('Error parsing date:', item.date, error);
            return 'Invalid Date'; // Default value in case of error
          }
        });

        const data = salesData.map(item => {
          // Ensure sale is a number
          const sale = Number(item.sale); // Use sale instead of finishedgoodQty
          return isNaN(sale) ? 0 : sale;
        });

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Sales Value Over Time',
              data: data,
              fill: false,
              borderColor: 'rgba(75,192,192,1)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Sales Value Over Time',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Sales for Last Month',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Sales Value (Rs.)',
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default Chart;
