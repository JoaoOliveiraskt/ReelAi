import { Skeleton } from "./ui/skeleton";
import { View } from "./ui/view";

export default function MovieCardSkeleton() {
  return (
    <View>
      {Array.from({ length: 3 }).map((_, i) => (
        <View
          key={i}
          style={{
            borderRadius: 32,
            marginBottom: 16,
            overflow: "hidden",
            height: 450,
            justifyContent: "flex-end",
          }}
        >
          {/* Poster skeleton */}
          <Skeleton
            width="100%"
            height={450}
            style={{ borderRadius: 32, position: "relative" }}
          />

          {/* Content area: title + meta (ano, runtime, nota) matching MovieCard structure */}
          <View style={{ padding: 20, position: "absolute" }}>
            {/* Title skeleton */}
            <Skeleton
              width="100%"
              height={32}
              style={{ borderRadius: 8, marginBottom: 8 }}
            />

            {/* Meta row: year, runtime, rating */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 8,
              }}
            >
              <Skeleton
                width={64}
                height={18}
                style={{ borderRadius: 8, marginRight: 8 }}
              />
              <Skeleton width={80} height={18} style={{ borderRadius: 8 }} />
            </View>
            <View>
              <Skeleton
                width={40}
                height={18}
                style={{ borderRadius: 8, marginTop: 8 }}
              />
            </View>
          </View>
          <Skeleton
            width={80}
            height={80}
            style={{
              borderRadius: 100,
              position: "absolute",
              bottom: 20,
              right: 20,
            }}
          />
        </View>
      ))}
    </View>
  );
}
