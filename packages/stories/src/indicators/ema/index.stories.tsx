import * as React from "react";
import { LineSeries } from "@react-financial-charts/series";
import EMAIndicator from "./emaIndicator";

export default {
    title: "Visualization/Indicator/EMA",
    component: LineSeries,
    parameters: {
        componentSubtitle: "Moving averages smooth the price data to form a trend following indicator.",
    },
};

export const basic = () => <EMAIndicator />;
