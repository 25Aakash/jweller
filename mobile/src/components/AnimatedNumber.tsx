import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function AnimatedNumber({
  value,
  duration = 1000,
  style,
  prefix = '',
  suffix = '',
  decimals = 2,
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.current = v;
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  const [displayText, setDisplayText] = React.useState(`${prefix}${value.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText(`${prefix}${displayValue.current.toFixed(decimals)}${suffix}`);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [prefix, suffix, decimals]);

  return <Text style={style}>{displayText}</Text>;
}
