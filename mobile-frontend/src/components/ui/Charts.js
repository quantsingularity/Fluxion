import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { colors, spacing } from "../../theme/theme";

// Lightweight, dependency-free charts drawn directly with react-native-svg so
// the mobile app matches the web's recharts visuals without a heavy chart lib.

const buildLinePath = (values, width, height, pad = 4) => {
  if (!values.length) return { line: "", area: "" };
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (values.length - 1 || 1);

  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const area = `${line} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;
  return { line, area };
};

export const AreaChartMini = ({
  data = [],
  height = 150,
  color = colors.brand[500],
  stroke = 2,
}) => {
  const values = data.map((d) => (typeof d === "number" ? d : d.value));
  const [width, setWidth] = useState(320);
  const { line, area } = buildLinePath(values, width, height);

  return (
    <View
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Svg width="100%" height={height}>
        <Defs>
          <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.45" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        {area ? <Path d={area} fill="url(#areaFill)" /> : null}
        {line ? (
          <Path d={line} fill="none" stroke={color} strokeWidth={stroke} />
        ) : null}
      </Svg>
    </View>
  );
};

export const BarChartMini = ({
  data = [],
  height = 160,
  color = colors.brand[500],
  labels = true,
}) => {
  const [width, setWidth] = useState(320);
  const values = data.map((d) => (typeof d === "number" ? d : d.value));
  const max = Math.max(...values, 1);
  const pad = 4;
  const gap = 8;
  const barW = (width - pad * 2 - gap * (data.length - 1)) / (data.length || 1);
  const chartH = labels ? height - 20 : height;

  return (
    <View
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Svg width="100%" height={height}>
        {values.map((v, i) => {
          const h = (v / max) * (chartH - pad);
          const x = pad + i * (barW + gap);
          const y = chartH - h;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barW > 0 ? barW : 1}
              height={h}
              rx={4}
              fill={color}
              opacity={0.85}
            />
          );
        })}
      </Svg>
      {labels ? (
        <View style={styles.labelRow}>
          {data.map((d, i) => (
            <Text key={i} style={styles.axisLabel} numberOfLines={1}>
              {typeof d === "object" ? d.name : ""}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export const DonutChart = ({ data = [], size = 160, thickness = 22 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const circle = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={d.color}
              strokeWidth={thickness}
              fill="transparent"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
      </G>
    </Svg>
  );
};

export const Sparkline = ({
  data = [],
  width = 90,
  height = 34,
  color = colors.success,
}) => {
  const values = data.map((d) => (typeof d === "number" ? d : d.value));
  const { line } = buildLinePath(values, width, height, 2);
  return (
    <Svg width={width} height={height}>
      {line ? (
        <Path d={line} fill="none" stroke={color} strokeWidth={2} />
      ) : (
        <Line
          x1={2}
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
          stroke={color}
          strokeWidth={2}
        />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingHorizontal: 2,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 10,
    flex: 1,
    textAlign: "center",
  },
});

export default {
  AreaChartMini,
  BarChartMini,
  DonutChart,
  Sparkline,
};
