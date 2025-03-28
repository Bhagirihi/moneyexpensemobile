import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";

const { width } = Dimensions.get("window");

export const AnalysisScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState({
    id: 1,
    name: "Summer Vacation 2024",
    date: "Jun 15 - Jun 30",
  });
  const [trips, setTrips] = useState([
    { id: 1, name: "Summer Vacation 2024", date: "Jun 15 - Jun 30" },
    { id: 2, name: "Weekend Trip", date: "Mar 1 - Mar 3" },
    { id: 3, name: "Business Trip", date: "Feb 10 - Feb 15" },
  ]);
  const [analysisData, setAnalysisData] = useState({
    totalExpense: 0,
    totalBudget: 0,
    perPersonBudget: 0,
    participants: [],
    settlements: [],
  });

  useEffect(() => {
    fetchAnalysisData();
  }, [selectedTrip]);

  const fetchAnalysisData = async () => {
    try {
      // TODO: Replace with actual Supabase query
      const dummyData = {
        totalExpense: 1500,
        totalBudget: 2000,
        perPersonBudget: 500,
        participants: [
          { id: 1, name: "John", spent: 800, percentage: 53.33 },
          { id: 2, name: "Alice", spent: 400, percentage: 26.67 },
          { id: 3, name: "Bob", spent: 300, percentage: 20 },
        ],
        settlements: [
          { from: "Alice", to: "John", amount: 150 },
          { from: "Bob", to: "John", amount: 200 },
        ],
      };
      setAnalysisData(dummyData);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTripSelector = () => (
    <TouchableOpacity
      style={[styles.tripSelector, { backgroundColor: theme.cardBackground }]}
      onPress={() => setShowTripSelector(true)}
    >
      <View style={styles.tripSelectorContent}>
        <View>
          <Text
            style={[styles.tripSelectorLabel, { color: theme.textSecondary }]}
          >
            Selected Trip
          </Text>
          <Text style={[styles.tripSelectorName, { color: theme.text }]}>
            {selectedTrip.name}
          </Text>
          <Text
            style={[styles.tripSelectorDate, { color: theme.textSecondary }]}
          >
            {selectedTrip.date}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={theme.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderTripSelectorModal = () => (
    <Modal
      visible={showTripSelector}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTripSelector(false)}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Trip
            </Text>
            <TouchableOpacity onPress={() => setShowTripSelector(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripItem,
                  {
                    backgroundColor:
                      selectedTrip.id === trip.id
                        ? theme.primary + "20"
                        : "transparent",
                  },
                ]}
                onPress={() => {
                  setSelectedTrip(trip);
                  setShowTripSelector(false);
                }}
              >
                <View>
                  <Text style={[styles.tripItemName, { color: theme.text }]}>
                    {trip.name}
                  </Text>
                  <Text
                    style={[
                      styles.tripItemDate,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {trip.date}
                  </Text>
                </View>
                {selectedTrip.id === trip.id && (
                  <MaterialCommunityIcons
                    name="check"
                    size={24}
                    color={theme.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSummaryCard = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <MaterialCommunityIcons
            name="chart-box"
            size={24}
            color={theme.primary}
            style={styles.cardHeaderIcon}
          />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Trip Summary
          </Text>
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <StatCard
          title="Expense"
          value={`$${analysisData.totalExpense}`}
          icon="cash-multiple"
          style={styles.summaryItem}
        />
        <StatCard
          title="Budget"
          value={`$${analysisData.totalBudget}`}
          icon="wallet"
          style={styles.summaryItem}
        />
        <StatCard
          title="Per Person"
          value={`$${analysisData.perPersonBudget}`}
          icon="account-group"
          style={styles.summaryItem}
        />
        <StatCard
          title="Status"
          value={
            analysisData.totalExpense > analysisData.totalBudget
              ? "Over Budget"
              : "Under Budget"
          }
          icon={
            analysisData.totalExpense > analysisData.totalBudget
              ? "alert-circle"
              : "check-circle"
          }
          trendType={
            analysisData.totalExpense > analysisData.totalBudget
              ? "negative"
              : "positive"
          }
          style={styles.summaryItem}
          valueStyle={{
            fontSize: 16,
            color:
              analysisData.totalExpense > analysisData.totalBudget
                ? theme.error
                : theme.success,
            fontWeight: "800",
          }}
        />
      </View>
    </Card>
  );

  const renderParticipantSpending = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Per Person Spending
        </Text>
        <MaterialCommunityIcons
          name="account-group"
          size={24}
          color={theme.primary}
        />
      </View>
      {analysisData.participants.map((participant) => (
        <View key={participant.id} style={styles.participantItem}>
          <View style={styles.participantInfo}>
            <View
              style={[
                styles.participantAvatar,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={theme.primary}
              />
            </View>
            <View style={styles.participantDetails}>
              <Text style={[styles.participantName, { color: theme.text }]}>
                {participant.name}
              </Text>
              <View style={styles.percentageBar}>
                <View
                  style={[
                    styles.percentageFill,
                    {
                      width: `${participant.percentage}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.participantPercentage,
                  { color: theme.textSecondary },
                ]}
              >
                {participant.percentage}% of total
              </Text>
            </View>
          </View>
          <Text style={[styles.participantAmount, { color: theme.text }]}>
            ${participant.spent}
          </Text>
        </View>
      ))}
    </Card>
  );

  const renderSettlements = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Payment Settlements
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Who needs to pay whom
          </Text>
        </View>
        <MaterialCommunityIcons
          name="cash-transfer"
          size={24}
          color={theme.primary}
        />
      </View>
      {analysisData.settlements.map((settlement, index) => (
        <View key={index} style={styles.settlementItem}>
          <View style={styles.settlementContent}>
            <View style={styles.settlementFrom}>
              <View
                style={[
                  styles.settlementAvatar,
                  { backgroundColor: theme.error + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={theme.error}
                />
              </View>
              <Text style={[styles.settlementName, { color: theme.text }]}>
                {settlement.from}
              </Text>
            </View>
            <View style={styles.settlementArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={theme.textSecondary}
              />
            </View>
            <View style={styles.settlementTo}>
              <View
                style={[
                  styles.settlementAvatar,
                  { backgroundColor: theme.success + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={theme.success}
                />
              </View>
              <Text style={[styles.settlementName, { color: theme.text }]}>
                {settlement.to}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.settlementAmountContainer,
              { backgroundColor: theme.primary + "10" },
            ]}
          >
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={theme.primary}
              style={styles.settlementAmountIcon}
            />
            <Text style={[styles.settlementAmount, { color: theme.primary }]}>
              ${settlement.amount}
            </Text>
          </View>
        </View>
      ))}
      {analysisData.settlements.length === 0 && (
        <View style={styles.emptySettlements}>
          <MaterialCommunityIcons
            name="check-circle"
            size={40}
            color={theme.success}
            style={styles.emptySettlementsIcon}
          />
          <Text
            style={[
              styles.emptySettlementsText,
              { color: theme.textSecondary },
            ]}
          >
            All payments are settled!
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header title="Analysis" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={40}
            color={theme.primary}
            style={styles.loadingIcon}
          />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading analysis...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header title="Analysis" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {renderTripSelector()}
        {renderSummaryCard()}
        {renderParticipantSpending()}
        {renderSettlements()}
      </ScrollView>
      {renderTripSelectorModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  tripSelector: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripSelectorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripSelectorLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  tripSelectorName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  tripSelectorDate: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalList: {
    maxHeight: "80%",
  },
  tripItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tripItemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  tripItemDate: {
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: (width - 64) / 2.1,
    marginBottom: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  percentageBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginBottom: 4,
  },
  percentageFill: {
    height: "100%",
    borderRadius: 2,
  },
  participantPercentage: {
    fontSize: 12,
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
  },
  settlementItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settlementContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settlementFrom: {
    flexDirection: "row",
    alignItems: "center",
  },
  settlementTo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settlementAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  settlementName: {
    fontSize: 16,
    fontWeight: "500",
  },
  settlementArrow: {
    marginHorizontal: 12,
  },
  settlementAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  settlementAmountIcon: {
    marginRight: 4,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySettlements: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptySettlementsIcon: {
    marginBottom: 12,
  },
  emptySettlementsText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
