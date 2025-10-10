import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useRef } from 'react';
import { DashboardService } from './dashboard.service';
import { getAuthUserData } from '../utils/helper';
import './dashboard.css';

Chart.register(...registerables);

const dashboardService = new DashboardService();

// API item interfaces
interface EsnServiceItem { title: string; typeCount: number }
interface DevicesByDateItem { createdDate: string; device_count: number }
interface TopUserItem { userName: string; max_device_count: number }

const Dashboard: React.FC = () => {
  // canvas refs
  const allDevicesRef = useRef<HTMLCanvasElement | null>(null);
  const topUsersRef = useRef<HTMLCanvasElement | null>(null);
  const devicesTypeRef = useRef<HTMLCanvasElement | null>(null);
  const esnServicesRef = useRef<HTMLCanvasElement | null>(null);
  // chart instances
  const allDevicesChart = useRef<Chart | null>(null);
  const topUsersChart = useRef<Chart | null>(null);
  const devicesTypeChart = useRef<Chart | null>(null);
  const esnServicesChart = useRef<Chart | null>(null);
  const [statCounts, setStatCounts] = useState({ clients: 0, testers: 0, stations: 0, warehouses: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [chartFilter, setChartFilter] = useState<string>(new Date().toLocaleString('en-US', { month: '2-digit' }));

  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' }
  ];

  function changeMonthHandler(value: string) {
    setChartFilter(value);
    processedDevicesCountByDate(value);
  }

  useEffect(() => {
    const auth = getAuthUserData();
    setIsAdmin(auth ? auth.roleSlug === 'admin' : false);
    getDevicesBytype();
    getStatsCount();
    processedDevicesCountByDate((new Date()).toLocaleString('en-US', { month: '2-digit' }));
    getDevicesCountOfTopUsers();
    getEsnServices();
    return () => {
      // cleanup charts on unmount
      allDevicesChart.current?.destroy();
      topUsersChart.current?.destroy();
      devicesTypeChart.current?.destroy();
      esnServicesChart.current?.destroy();
    };
  }, []);

  async function getDevicesBytype() {
    try {
      const result = await dashboardService.getDevicesBytype();
      if (result.status) {
        const iosDevices = result.data[0].ios_sum || 0;
        const androidDevices = result.data[0].android_sum || 0;
        const data = {
          labels: ['IOS Devices', 'Android Devices'],
          datasets: [{ data: [iosDevices, androidDevices], backgroundColor: ['rgb(255,99,132)','rgb(54,162,235)'] }]
        };
        // destroy previous chart if exists
        if (devicesTypeChart.current) devicesTypeChart.current.destroy();
        if (devicesTypeRef.current) devicesTypeChart.current = new Chart(devicesTypeRef.current, { type: 'pie', data });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function getEsnServices() {
    try {
      const result = await dashboardService.getEsnServices();
      if (result.status && result.data) {
        const dataArr = result.data as EsnServiceItem[];
        const labels = dataArr.map((i) => i.title);
        const counts = dataArr.map((i) => i.typeCount);
        if (esnServicesChart.current) esnServicesChart.current.destroy();
        if (esnServicesRef.current) esnServicesChart.current = new Chart(esnServicesRef.current, { type: 'pie', data: { labels, datasets: [{ data: counts }] } });
      }
    } catch (err) { console.error(err); }
  }

  async function processedDevicesCountByDate(searchType: string) {
    try {
      const result = await dashboardService.getDevicesCountByDate(searchType);
      if (result.status && result.data) {
        const dataArr = result.data as DevicesByDateItem[];
        const dates = dataArr.map((d) => d.createdDate);
        const counts = dataArr.map((d) => d.device_count);
        if (allDevicesChart.current) allDevicesChart.current.destroy();
        if (allDevicesRef.current) allDevicesChart.current = new Chart(allDevicesRef.current, {
          type: 'line',
          data: { labels: dates, datasets: [{ label: 'Devices', data: counts, borderColor: '#4EAD38' }] },
          options: { maintainAspectRatio: false, responsive: true }
        });
      }
    } catch (err) { console.error(err); }
  }

  async function getDevicesCountOfTopUsers() {
    try {
      const result = await dashboardService.getDevicesCountOfTopUsers();
      if (result.status && result.data) {
        const dataArr = result.data as TopUserItem[];
        const labels = dataArr.map((i) => i.userName);
        const counts = dataArr.map((i) => i.max_device_count);
        if (topUsersChart.current) topUsersChart.current.destroy();
        if (topUsersRef.current) topUsersChart.current = new Chart(topUsersRef.current, { type: 'bar', data: { labels, datasets: [{ label: 'Devices', data: counts }] } });
      }
    } catch (err) { console.error(err); }
  }

  async function getStatsCount() {
    try {
      const result = await dashboardService.getCount();
      if (result.status) setStatCounts(result.data);
    } catch (err) { console.error(err); }
  }

  return (
    <div>
      {/* Breadcrumb/header placeholder - replace with real header component when available */}
      <div className="app-header">Dashboard</div>

      <div className="container-fluid pt-8">
        <div className="row">
          {isAdmin && (
            <div className="col-xl-3 col-md-6">
              <div className="card card-stats">
                <div className="card-body">
                  <div className="row">
                    <div className="col">
                      <h5 className="card-title text-uppercase text-muted mb-0">Clients</h5>
                      <span className="h2 font-weight-bold mb-0">{(statCounts.clients > 0 && statCounts.clients < 10) ? '0' + statCounts.clients : statCounts.clients}</span>
                    </div>
                    <div className="col-auto">
                      <div className="icon icon-shape bg-gradient-red text-white rounded-circle shadow">
                        <i className="ni ni-active-40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`${isAdmin ? 'col-xl-3' : 'col-xl-4'} col-md-6`}>
            <div className="card card-stats">
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <h5 className="card-title text-uppercase text-muted mb-0">Testers</h5>
                    <span className="h2 font-weight-bold mb-0">{(statCounts.testers > 0 && statCounts.testers < 10) ? '0' + statCounts.testers : statCounts.testers}</span>
                  </div>
                  <div className="col-auto">
                    <div className="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
                      <i className="ni ni-chart-pie-35" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isAdmin ? 'col-xl-3' : 'col-xl-4'} col-md-6`}>
            <div className="card card-stats">
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <h5 className="card-title text-uppercase text-muted mb-0">Stations</h5>
                    <span className="h2 font-weight-bold mb-0">{(statCounts.stations > 0 && statCounts.stations < 10) ? '0' + statCounts.stations : statCounts.stations}</span>
                  </div>
                  <div className="col-auto">
                    <div className="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                      <i className="ni ni-money-coins" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isAdmin ? 'col-xl-3' : 'col-xl-4'} col-md-6`}>
            <div className="card card-stats">
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <h5 className="card-title text-uppercase text-muted mb-0">Warehouses</h5>
                    <span className="h2 font-weight-bold mb-0">{(statCounts.warehouses > 0 && statCounts.warehouses < 10) ? '0' + statCounts.warehouses : statCounts.warehouses}</span>
                  </div>
                  <div className="col-auto">
                    <div className="icon icon-shape bg-gradient-info text-white rounded-circle shadow">
                      <i className="ni ni-chart-bar-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-8">
            <div className="card ">
              <div className="card-header bg-transparent">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Overview</h6>
                    <h5 className="h3  mb-0">Processed Devices</h5>
                  </div>
                  <div className="col chart-btns">
                    <ul className="nav nav-pills justify-content-end">
                      <li className="nav-item mr-2 mr-md-0">
                        <select id="month" className="form-control filter-drop-down" value={chartFilter} onChange={(e) => changeMonthHandler(e.target.value)}>
                          <option disabled value="week">Select Month</option>
                          {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </li>
                      <li className="nav-item">
                        <a onClick={() => processedDevicesCountByDate('week')} className={`nav-link py-2 px-3 btn-type ${chartFilter === 'week' ? 'active' : ''}`}>
                          <span className="d-none d-md-block ">Week</span>
                          <span className="d-md-none">W</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body chart-container">
                <div className="chart">
                  <canvas id="chart-alldevices" className="chart-canvas" ref={allDevicesRef} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="card">
              <div className="card-header bg-transparent">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Performance</h6>
                    <h5 className="h3 mb-0">Top Users</h5>
                  </div>
                </div>
              </div>
              <div className="card-body chart-container">
                <div className="chart">
                  <canvas id="chart-topusers" className="chart-canvas" height={330} ref={topUsersRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header bg-transparent">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Performance</h6>
                    <h5 className="h3 mb-0">Total Processed Devices</h5>
                  </div>
                </div>
              </div>
              <div className="card-body chart-container">
                <div className="chart">
                  <canvas id="pieChart-devicesType" className="chart-canvas" ref={devicesTypeRef} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header bg-transparent">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Performance</h6>
                    <h5 className="h3 mb-0">Licenses</h5>
                  </div>
                </div>
              </div>
              <div className="card-body chart-container">
                <div className="chart">
                  <canvas id="pieChart-esnServices" className="chart-canvas" ref={esnServicesRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
