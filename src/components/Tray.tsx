import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { PieceShape } from "@/components/PieceShape";
import type { PieceId, Rotation } from "@/game/types";

type Props = {
  ids: PieceId[];
  cell: number;
  selectedId: PieceId | null;
  rotOf: (id: PieceId) => Rotation;
  hiddenId: PieceId | null;
  onPress: (id: PieceId) => void;
  onDrag: (id: PieceId, x: number, y: number, phase: "start" | "move" | "end") => void;
};

export function Tray({ ids, cell, selectedId, rotOf, hiddenId, onPress, onDrag }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const metrics = useRef({ x: 0, layout: 0, content: 0 });
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function syncEdges() {
    const { x, layout, content } = metrics.current;
    const overflow = content - layout > 8;
    const left = overflow && x > 8;
    const right = overflow && x + layout < content - 8;
    setCanLeft((current) => (current === left ? current : left));
    setCanRight((current) => (current === right ? current : right));
  }

  function scrollBy(direction: -1 | 1) {
    const { x, layout, content } = metrics.current;
    const step = Math.max(120, layout * 0.7);
    const next = Math.max(0, Math.min(Math.max(0, content - layout), x + direction * step));
    scrollRef.current?.scrollTo({ x: next, animated: true });
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        scrollEventThrottle={16}
        onLayout={(event) => {
          metrics.current.layout = event.nativeEvent.layout.width;
          syncEdges();
        }}
        onContentSizeChange={(width) => {
          metrics.current.content = width;
          syncEdges();
        }}
        onScroll={(event) => {
          metrics.current.x = event.nativeEvent.contentOffset.x;
          syncEdges();
        }}
      >
        {ids.map((id) => (
          <TrayPiece
            key={id}
            id={id}
            cell={cell}
            rot={rotOf(id)}
            selected={selectedId === id}
            hidden={hiddenId === id}
            onPress={onPress}
            onDrag={onDrag}
          />
        ))}
      </ScrollView>
      {canLeft ? (
        <Pressable style={[styles.arrow, styles.arrowLeft]} onPress={() => scrollBy(-1)} hitSlop={6}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </Pressable>
      ) : null}
      {canRight ? (
        <Pressable style={[styles.arrow, styles.arrowRight]} onPress={() => scrollBy(1)} hitSlop={6}>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

function TrayPiece({
  id,
  cell,
  rot,
  selected,
  hidden,
  onPress,
  onDrag,
}: {
  id: PieceId;
  cell: number;
  rot: Rotation;
  selected: boolean;
  hidden: boolean;
  onPress: (id: PieceId) => void;
  onDrag: (id: PieceId, x: number, y: number, phase: "start" | "move" | "end") => void;
}) {
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onPress)(id);
  });
  const pan = Gesture.Pan()
    .minDistance(8)
    .onStart((event) => {
      runOnJS(onDrag)(id, event.absoluteX, event.absoluteY, "start");
    })
    .onUpdate((event) => {
      runOnJS(onDrag)(id, event.absoluteX, event.absoluteY, "move");
    })
    .onEnd((event) => {
      runOnJS(onDrag)(id, event.absoluteX, event.absoluteY, "end");
    });

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={{ opacity: hidden ? 0.15 : 1, marginRight: 10 }}>
        <PieceShape id={id} rot={rot} cell={cell} selected={selected} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  arrow: {
    position: "absolute",
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#14b374",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 4,
    shadowColor: "#127A4E",
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
});
