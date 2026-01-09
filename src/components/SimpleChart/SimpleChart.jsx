import React from "react";

export default function SimpleChart({ data, dataKey, color }) {
  // Безопасная проверка данных
  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-[150px] w-full bg-gray-800/50 p-4 rounded-lg">
          <span className="text-gray-400">No data available</span>
        </div>
    );
  }

  // Фильтруем данные, чтобы исключить невалидные значения
  const validData = data.filter(d => d && typeof d[dataKey] === 'number' && !isNaN(d[dataKey]));

  if (validData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[150px] w-full bg-gray-800/50 p-4 rounded-lg">
          <span className="text-gray-400">No valid data for {dataKey}</span>
        </div>
    );
  }

  const maxValue = Math.max(...validData.map(d => d[dataKey]));
  const chartHeight = 150;

  return (
      <div className="flex items-end justify-between w-full bg-gray-800/50 p-4 rounded-lg">
        {validData.map((d, i) => {
          const barHeight = maxValue > 0 ? (d[dataKey] / maxValue) * chartHeight * 0.9 : 0;
          return (
              <div key={i} className="flex flex-col items-center group w-full">
                <div
                    className={`w-4/5 rounded-t-md ${color} transition-all duration-300`}
                    style={{ height: `${Math.max(barHeight, 2)}px` }}
                >
              <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center block">
                {d[dataKey].toFixed(1)}
              </span>
                </div>
                <span className="text-xs text-gray-400 mt-2">
              {d.day !== undefined ? `${d.day}d` : i}
            </span>
              </div>
          );
        })}
      </div>
  );
}