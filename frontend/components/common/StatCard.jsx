// components/common/StatCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ stat }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
