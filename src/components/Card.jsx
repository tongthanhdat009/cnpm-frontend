import React from "react";

const Card = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>
        <div className="text-gray-600">{children}</div>
    </div>
);
export default Card;