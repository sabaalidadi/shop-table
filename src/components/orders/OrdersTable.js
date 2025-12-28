"use client"

import { useState, useMemo } from "react"
import { TextField, Skeleton } from "@mui/material"
import MUIDataTable from "mui-datatables"
import * as XLSX from "xlsx"
import DatePicker from "react-multi-date-picker"
import persian_fa from "react-date-object/locales/persian_fa"
import persian from "react-date-object/calendars/persian"
import moment from "moment-jalaali"

import './OrdersTable.css'

export default function OrdersTable({ orders, loading = false }) {
  const [searchCustomer, setSearchCustomer] = useState("")
  const [searchOrderID, setSearchOrderID] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState([])

const handleDateChange = (value) => {
  setSelectedDateRange(value || []);

  if (value?.length === 2) {
    const start = value[0].toDate();
    const end = value[1].toDate();
  } else {
    console.log("بازه‌ای انتخاب نشده");
  }
};

const filteredOrders = useMemo(() => {
  return orders.filter((o) => {
    let inDateRange = true;

    if (selectedDateRange.length === 2) {
      const start = selectedDateRange[0].toDate();
      const end = selectedDateRange[1].toDate();
      const orderDate = new Date(o.date);

      inDateRange =
        orderDate.getTime() >= start.getTime() &&
        orderDate.getTime() <= end.getTime();
    }

    return (
      o.customerName.includes(searchCustomer) &&
      o.orderID.toString().includes(searchOrderID) &&
      o.phone.includes(searchPhone) &&
      inDateRange
    );
  });
}, [orders, searchCustomer, searchOrderID, searchPhone, selectedDateRange]);


  const columns = [
    { name: "orderID", label: "شماره سفارش" },
    { name: "customerName", label: "نام مشتری" },
    {
      name: "date",
      label: "تاریخ",
      options: {
        customBodyRender: (value) => moment(value, "YYYY-MM-DD").format("jYYYY/jMM/jDD")
      }
    },
    {
      name: "status",
      label: "وضعیت سفارش",
      options: {
        customBodyRender: (value) => {
          const statusMap = {
            pending: "در انتظار",
            processing: "در حال پردازش",
            delivered: "تحویل شده",
            cancelled: "لغو شده",
          }
          return statusMap[value] || value
        },
      },
    },
    {
      name: "totalAmount",
      label: "مبلغ (تومان)",
      options: {
        customBodyRender: (value) => value.toLocaleString("fa-IR"),
      },
    },
    { name: "phone", label: "شماره تماس" },
  ]

  const handleExportExcel = () => {
    const wsData = filteredOrders.map((o) => ({
      "شماره سفارش": o.orderID,
      "نام مشتری": o.customerName,
      تاریخ: o.date,
      "وضعیت سفارش": { pending: "در انتظار", processing: "در حال پردازش", delivered: "تحویل شده", cancelled: "لغو شده" }[o.status],
      "مبلغ (تومان)": o.totalAmount,
      "شماره تماس": o.phone,
    }))
    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Orders")
    XLSX.writeFile(wb, "orders.xlsx")
  }

  const options = {
    selectableRows: "none",
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 25, 50, 100],
    responsive: "standard",
    textLabels: {
      body: { noMatch: "داده‌ای برای نمایش وجود ندارد" },
      toolbar: {
        search: "جستجو",
        downloadCsv: "دانلود Excel",
        viewColumns: "نمایش ستون‌ها",
      },
      pagination: {
        next: "صفحه بعد",
        previous: "صفحه قبل",
        rowsPerPage: "تعداد در هر صفحه:",
      },
    },
    customToolbar: () => (
      <button
        onClick={handleExportExcel}
        style={{
          background: "#1E3C6E",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Export Excel
      </button>
    ),
  }

  const dataToDisplay = loading
    ? Array.from({ length: 5 }, () =>
        columns.map(() => <Skeleton variant="text" width="100%" height={24} />)
      )
    : filteredOrders

 return (
  <div className="orders-table-wrapper" style={{ direction: "rtl", padding: "1rem" }}>
    <div className="orders-filters">
      <TextField
        label="جستجوی نام مشتری"
        size="small"
        value={searchCustomer}
        onChange={(e) => setSearchCustomer(e.target.value)}
      />
      <TextField
        label="جستجوی شماره سفارش"
        size="small"
        value={searchOrderID}
        onChange={(e) => setSearchOrderID(e.target.value)}
      />
      <TextField
        label="جستجوی شماره موبایل"
        size="small"
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
      />
      <div className="date-container">
        <label style={{ display: "block", marginBottom: 4 , fontWeight:'bold' , color:'#1E3C6E'}}>بازه تاریخ</label>
        <DatePicker
          value={selectedDateRange}
          range
          calendar={persian}
          locale={persian_fa}
          onChange={handleDateChange}
          style={{ width: '250px', marginBottom: '1rem' }}
          format="YYYY/MM/DD"
          placeholder="انتخاب بازه تاریخ"
        />
      </div>
    </div>
   <MUIDataTable 
      title={<span className="title-table">لیست سفارش‌ها</span>}
      data={dataToDisplay}
      columns={columns}
      options={{
        ...options,
        customToolbar: () => (
          <button onClick={handleExportExcel} className="export-btn">
          خروجی اکسل
          </button>
        )
      }}
    />
   
  </div>
)
}
