

import React, { useEffect, useState } from 'react';

const TableComponent = () => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/get_csv_data")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTableData(data);
      })
      .catch((err) => setError("Error fetching data"));
  }, []);

  if (error) return <p>{error}</p>;

  if (tableData.length === 0) return <p>Loading...</p>;

  const headers = Object.keys(tableData[0]);

  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          {headers.map((head) => (
            <th key={head}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, i) => (
          <tr key={i}>
            {headers.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableComponent;
