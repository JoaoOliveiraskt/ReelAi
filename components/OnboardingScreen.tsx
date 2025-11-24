import { View, StyleSheet, Dimensions, Image } from "react-native";
import { Onboarding, OnboardingStep } from "@/components/ui/onboarding";
import { Film, MessageCircle, Sparkles } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// Imagens de exemplo (URLs de banco de imagens)
const movieImages = [
  "https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
];

function CircularImages() {
  const radius = 120;
  const centerX = width / 2;
  const centerY = height / 2 - 100;

  return (
    <View style={styles.circularContainer}>
      {/* Círculo central com logo */}
      <View style={styles.centerCircle}>
        <Film size={40} color="#007AFF" />
      </View>

      {/* Imagens em círculo */}
      {movieImages.map((imageUrl, index) => {
        const angle = (index * 2 * Math.PI) / movieImages.length;
        const x = centerX + radius * Math.cos(angle) - 30;
        const y = centerY + radius * Math.sin(angle) - 30;

        return (
          <View
            key={index}
            style={[
              styles.imageContainer,
              {
                left: x,
                top: y,
              },
            ]}
          >
            <Image source={{ uri: imageUrl }} style={styles.circularImage} />
          </View>
        );
      })}
    </View>
  );
}

function IconWithGradient({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "chat" | "magic";
}) {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconWrapper}>{children}</View>
    </View>
  );
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const steps: OnboardingStep[] = [
    {
      id: "1",
      title: "Descubra Filmes Incríveis",
      description:
        "Explore milhares de filmes e séries com informações detalhadas e onde assistir",
      icon: <CircularImages />,
    },
    {
      id: "2",
      title: "Chat com IA Inteligente",
      description:
        "Converse com nossa IA e receba recomendações personalizadas baseadas no seu gosto",
      icon: (
        <IconWithGradient variant="chat">
          <MessageCircle size={80} color="#007AFF" />
        </IconWithGradient>
      ),
    },
    {
      id: "3",
      title: "Experiência Mágica",
      description:
        "Transforme a forma como você descobre entretenimento. Sua jornada cinematográfica começa aqui!",
      icon: (
        <IconWithGradient variant="magic">
          <Sparkles size={80} color="#007AFF" />
        </IconWithGradient>
      ),
    },
  ];

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
      onComplete();
    } catch (error) {
      onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
      onComplete();
    } catch (error) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding
        steps={steps}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  circularContainer: {
    width: width,
    height: 300,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 220,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconWrapper: {
    zIndex: 10,
  },
  centerCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    top: height / 2 - 140,
    left: width / 2 - 40,
  },
  imageContainer: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  circularImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
});
