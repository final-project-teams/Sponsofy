import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from "../theme/ThemeContext";
import api from "../config/axios";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddDeal = () => {
    const { currentTheme } = useTheme();
    const navigation = useNavigation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [terms, setTerms] = useState([
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' }
    ]);
    const [payement_terms, setPayement_terms] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");
    const [rank, setRank] = useState("");
    const [showRankDropdown, setShowRankDropdown] = useState(false);
    const [followers, setFollowers] = useState("20000");

    const [view, setView] = useState<"Basic Information" | "Terms" | "Criteria" | "Start & End Date" | "Review">("Basic Information");

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        budget: '',
        terms: '',
        payement_terms: '',
        start_date: '',
        end_date: '',
        rank: '',
        followers: '',
        criteria: '',
        subcriteria: ''
    });

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
    const [selectedSubCriteria, setSelectedSubCriteria] = useState<{ [key: string]: string }>({});

    const rankOptions = ['plat', 'gold', 'silver'];

    // const followerMarks = [
    //     { value: 20000, label: '20k' },
    //     { value: 2000000, label: '2M' },
    //     { value: 3500000, label: '3.5M' },
    //     { value: 5000000, label: '5M' },
    //     { value: 6500000, label: '6.5M' },
    //     { value: 8000000, label: '8M' },
    //     { value: 10000000, label: '10M' },
    // ];

    const handleTitleChange = (text: string) => {
        setTitle(text);
        if (errors.title) setErrors({ ...errors, title: '' });
    }

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
        if (errors.description) setErrors({ ...errors, description: '' });
    }

    const handleBudgetChange = (text: string) => {
        if (/^\d*\.?\d*$/.test(text)) {
            setBudget(text);
            if (errors.budget) setErrors({ ...errors, budget: '' });
        }
    }

    const handleTermsChange = (text: string) => {
        setPayement_terms(text);
        if (errors.payement_terms) setErrors({ ...errors, payement_terms: '' });
    }

    const handleRankSelect = (selectedRank: string) => {
        setRank(selectedRank);
        setShowRankDropdown(false);
        if (errors.rank) setErrors({ ...errors, rank: '' });
    }

    const handleContinueBasicInformation = () => {
        const newErrors = { ...errors };
        let isValid = true;

        if (!title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
        }

        if (!budget || parseFloat(budget) <= 0) {
            newErrors.budget = 'Valid budget is required';
            isValid = false;
        }

        if (!rank) {
            newErrors.rank = 'Rank is required';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            setView("Terms");
        }
    }

    const handleContinueTerms = () => {
        const newErrors = { ...errors };
        let isValid = true;

        if (!payement_terms) {
            newErrors.payement_terms = "Payment terms are required";
            isValid = false;
        }

        terms.forEach((term, index) => {
            if (!term.title) {
                newErrors[`term_${index}`] = `Term ${index + 1} is required`;
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (isValid) {
            setView("Criteria");
        }
    };

    const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate.toISOString().split('T')[0]);
            if (errors.start_date) setErrors({ ...errors, start_date: '' });
        }
    };

    const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate.toISOString().split('T')[0]);
            if (errors.end_date) setErrors({ ...errors, end_date: '' });
        }
    };

    const handleContinueDatetime = () => {
        const newErrors = { ...errors };
        let isValid = true;

        if (!start_date) {
            newErrors.start_date = "Start date is required";
            isValid = false;
        }
        if (!end_date) {
            newErrors.end_date = "End date is required";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            setView("Review");
        }
    };

    const handleContinueCriteria = () => {
        const newErrors = { ...errors };

        if (selectedCriteria.length === 0) {
            newErrors.criteria = "Please select at least one criteria";
            setErrors(newErrors);
            return;
        }

        const hasAllSubcriteria = selectedCriteria.every(
            criteria => selectedSubCriteria[criteria]
        );

        if (!hasAllSubcriteria) {
            newErrors.criteria = "Please select ranges for all criteria";
            setErrors(newErrors);
            return;
        }

        setView("Start & End Date");
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
        }

        if (!budget || parseFloat(budget) <= 0) {
            newErrors.budget = 'Valid budget is required';
            isValid = false;
        }

        if (!rank) {
            newErrors.rank = 'Rank is required';
            isValid = false;
        }

        if (!payement_terms.trim()) {
            newErrors.payement_terms = 'Terms are required';
            isValid = false;
        }

        if (!start_date.trim()) {
            newErrors.start_date = 'Start date is required';
            isValid = false;
        }

        if (!end_date.trim()) {
            newErrors.end_date = 'End date is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handlePostDeal = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            // Get both user data and token from AsyncStorage
            const [userString, token] = await Promise.all([
                AsyncStorage.getItem('userData'),
                AsyncStorage.getItem('userToken')
            ]);

            if (!userString || !token) {
                console.error('User data or token not found');
                // Handle the error appropriately (e.g., redirect to login)
                return;
            }

            const userData = JSON.parse(userString);

            // Create the deal data
            const dealData = {
                title,
                description,
                budget: parseFloat(budget),
                payement_terms,
                start_date,
                end_date,
                rank,
                company_id: userData.id,
                termsList: terms.filter(term => term.title.trim() !== ''),
                criteriaList: selectedCriteria.map(criteria => ({
                    name: criteria.toLowerCase(),
                    description: selectedSubCriteria[criteria]
                }))
            };

            // Make the API call with the token in headers
            const response = await api.post("/addDeal", dealData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                navigation.navigate("Home" as never);
            } else {
                console.error('Error response:', response.data);
                // Handle the error appropriately
                Alert.alert('Error', response.data.message || 'Failed to create deal');
            }

        } catch (error) {
            console.error('Error posting deal:', error);
            Alert.alert(
                'Error',
                'Failed to create deal. Please check your connection and try again.'
            );
        }
    };

    // const handleGoBack = () => {
    //     if (view === "Terms") {
    //         setView("Basic Information");
    //     } else if (view === "Criteria") {
    //         setView("Terms");
    //     } else if (view === "Start & End Date") {
    //         setView("Criteria");
    //     }
    // };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000000',
            padding: 20,
        },
        viewTitle: {
            fontSize: currentTheme.fontSizes.xxlarge,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: currentTheme.spacing.large,
        },
        label: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.text,
            marginBottom: currentTheme.spacing.xsmall,
        },
        input: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.medium,
            padding: currentTheme.spacing.medium,
            marginBottom: currentTheme.spacing.medium,
            color: currentTheme.colors.text,
            fontFamily: currentTheme.fonts.regular,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        errorText: {
            color: currentTheme.colors.error,
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.regular,
            marginTop: -currentTheme.spacing.small,
            marginBottom: currentTheme.spacing.small,
        },
        button: {
            backgroundColor: currentTheme.colors.primary,
            borderRadius: currentTheme.borderRadius.medium,
            padding: currentTheme.spacing.medium,
            alignItems: 'center',
            marginTop: currentTheme.spacing.medium,
        },
        buttonText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
        },
        dateButton: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.medium,
            padding: currentTheme.spacing.medium,
            marginBottom: currentTheme.spacing.medium,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        dateButtonText: {
            color: currentTheme.colors.text,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
        },
        progressContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 20,
            paddingHorizontal: 12,
            marginTop: 70,
        },
        progressStep: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        progressStepCircle: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#000000',
            borderWidth: 2,
            borderColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
        },
        progressStepActive: {
            backgroundColor: currentTheme.colors.primary,
            borderColor: currentTheme.colors.primary,
        },
        progressStepText: {
            color: currentTheme.colors.white,
            fontSize: 16,
            fontWeight: 'bold',
        },
        progressLine: {
            height: 6,
            width: 20,
            backgroundColor: currentTheme.colors.textSecondary,
        },
        progressLineActive: {
            backgroundColor: currentTheme.colors.primary,
        },
        backButton: {
            position: 'absolute',
            left: 20,
            top: 45,
            zIndex: 1,
        },
        continueText: {
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            marginTop: currentTheme.spacing.medium,
            textAlign: 'center',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.medium,
            padding: currentTheme.spacing.large,
            width: '80%',
            maxHeight: '70%',
        },
        modalTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: currentTheme.spacing.medium,
            textAlign: 'center',
        },
        optionItem: {
            paddingVertical: currentTheme.spacing.medium,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.colors.border,
        },
        optionText: {
            fontSize: currentTheme.fontSizes.medium,
            color: currentTheme.colors.text,
            textAlign: 'center',
        },
        termContainer: {
            marginBottom: currentTheme.spacing.medium,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
            borderRadius: currentTheme.borderRadius.medium,
            padding: currentTheme.spacing.medium,
        },
        termHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: currentTheme.spacing.small,
        },
        termLabel: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.text,
        },
        addTermButton: {
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: currentTheme.spacing.small,
        },
        plusButtonContainer: {
            width: '100%',
            height: 50,
            borderRadius: 20,
            backgroundColor: currentTheme.colors.background,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sectionTitle: {
            fontSize: currentTheme.fontSizes.xxlarge,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: currentTheme.spacing.large,
        },
        reviewSection: {
            marginBottom: currentTheme.spacing.large,
            padding: currentTheme.spacing.medium,
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.medium,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        reviewSectionTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: currentTheme.spacing.medium,
        },
        reviewItem: {
            marginBottom: currentTheme.spacing.medium,
        },
        reviewLabel: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.textSecondary,
            marginBottom: currentTheme.spacing.xsmall,
        },
        reviewValue: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.text,
        },
        reviewDescription: {
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            marginTop: currentTheme.spacing.xsmall,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: currentTheme.spacing.large,
            marginBottom: currentTheme.spacing.xlarge,
        },
        editButton: {
            flex: 1,
            marginRight: currentTheme.spacing.small,
            backgroundColor: currentTheme.colors.surface,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        postButton: {
            flex: 1,
            marginLeft: currentTheme.spacing.small,
        },
        sliderContainer: {
            backgroundColor: '#1A1A1A',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
        },
        selectedValue: {
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        sliderTrack: {
            height: 8,
            backgroundColor: '#333333',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 10,
        },
        sliderFill: {
            position: 'absolute',
            height: '100%',
            backgroundColor: '#8B5CF6',
            borderRadius: 4,
        },
        slider: {
            width: '100%',
            height: 40,
            marginTop: -16,
            zIndex: 1000,
        },
        markersContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
        },
        markerLabel: {
            color: '#999999',
            fontSize: 12,
        },
        stepLabelContainer: {
            alignItems: 'flex-start',
            marginTop: 20,
            marginBottom: 30,
        },
        currentStepLabel: {
            color: currentTheme.colors.text,
            fontSize: 24,
            fontWeight: 'bold',
        },
        criteriaContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: currentTheme.spacing.medium,
        },
        criteriaButton: {
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 12,
            backgroundColor: currentTheme.colors.surface,
            minWidth: 100,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        criteriaButtonActive: {
            backgroundColor: currentTheme.colors.primary,
        },
        criteriaButtonText: {
            color: currentTheme.colors.text,
            fontSize: 16,
            fontFamily: currentTheme.fonts.medium,
            textAlign: 'center',
        },
        criteriaSectionContainer: {
            marginBottom: 24,
        },
    });

    const getStepNumber = () => {
        switch (view) {
            case "Basic Information":
                return 1;
            case "Terms":
                return 2;
            case "Criteria":
                return 3;
            case "Start & End Date":
                return 4;
            case "Review":
                return 5;
            default:
                return 1;
        }
    };

    const getStepStyle = (stepNumber) => {
        const currentStep = getStepNumber();
        return stepNumber <= currentStep ? styles.progressStepActive : {};
    };

    const getLineStyle = (lineNumber) => {
        const currentStep = getStepNumber();
        return lineNumber < currentStep ? styles.progressLineActive : {};
    };

    const handleTermTitleChange = (text: string, index: number) => {
        const newTerms = [...terms];
        newTerms[index].title = text;
        setTerms(newTerms);
        if (errors[`term_${index}`]) setErrors({ ...errors, [`term_${index}`]: '' });
    };

    const handleTermDescriptionChange = (text: string, index: number) => {
        const newTerms = [...terms];
        newTerms[index].description = text;
        setTerms(newTerms);
    };

    const handleAddTerm = () => {
        setTerms([...terms, { title: '', description: '' }]);
    };

    const handleRemoveTerm = (index: number) => {
        if (terms.length > 3) {
            const newTerms = [...terms];
            newTerms.splice(index, 1);
            setTerms(newTerms);
        }
    };

    const getSubCriteriaOptions = (criteria: string) => {
        switch (criteria.toLowerCase()) {
            case 'followers':
                return ['Above 20k', 'Above 100k', 'Above 500k', 'Above 1M'];
            case 'views':
                return ['Above 50k', 'Above 200k', 'Above 1M', 'Above 5M'];
            case 'posts':
                return ['Above 100', 'Above 500', 'Above 1000'];
            default:
                return [];
        }
    };

    const handleStepNavigation = (targetStep: "Basic Information" | "Terms" | "Criteria" | "Start & End Date" | "Review") => {
        const currentStep = getStepNumber();
        const targetStepNumber = {
            "Basic Information": 1,
            "Terms": 2,
            "Criteria": 3,
            "Start & End Date": 4,
            "Review": 5
        }[targetStep];

        // Allow going backwards without validation
        if (targetStepNumber < currentStep) {
            setView(targetStep);
            return;
        }

        // For moving forward, validate current step
        let isValid = false;
        const newErrors = { ...errors };

        switch (view) {
            case "Basic Information":
                isValid = title.trim() !== '' &&
                    description.trim() !== '' &&
                    budget !== '' &&
                    rank !== '';

                if (!title.trim()) newErrors.title = 'Title is required';
                if (!description.trim()) newErrors.description = 'Description is required';
                if (!budget) newErrors.budget = 'Budget is required';
                if (!rank) newErrors.rank = 'Rank is required';
                break;

            case "Terms":
                isValid = payement_terms.trim() !== '' &&
                    terms.every(term => term.title.trim() !== '');

                if (!payement_terms.trim()) newErrors.payement_terms = 'Payment terms are required';
                terms.forEach((term, index) => {
                    if (!term.title.trim()) {
                        newErrors[`term_${index}`] = `Term ${index + 1} is required`;
                    }
                });
                break;

            case "Criteria":
                isValid = selectedCriteria.length > 0 &&
                    selectedCriteria.every(criteria => selectedSubCriteria[criteria]);

                if (selectedCriteria.length === 0) {
                    newErrors.criteria = "Please select at least one criteria";
                } else if (!selectedCriteria.every(criteria => selectedSubCriteria[criteria])) {
                    newErrors.criteria = "Please select ranges for all criteria";
                }
                break;

            case "Start & End Date":
                isValid = start_date !== '' && end_date !== '';

                if (!start_date) newErrors.start_date = "Start date is required";
                if (!end_date) newErrors.end_date = "End date is required";
                break;

            default:
                isValid = false;
        }

        if (isValid) {
            setView(targetStep);
        } else {
            setErrors(newErrors);
        }
    };

    const handleStepClick = (stepNumber: number) => {
        const stepMap = {
            1: "Basic Information",
            2: "Terms",
            3: "Criteria",
            4: "Start & End Date",
            5: "Review"
        } as const;

        handleStepNavigation(stepMap[stepNumber]);
    };

    return (
        <View style={styles.container}>
            {view !== "Basic Information" && view !== "Review" && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        switch (view) {
                            case "Terms":
                                handleStepNavigation("Basic Information");
                                break;
                            case "Criteria":
                                handleStepNavigation("Terms");
                                break;
                            case "Start & End Date":
                                handleStepNavigation("Criteria");
                                break;
                        }
                    }}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="#ffffff"
                    />
                </TouchableOpacity>
            )}
            <View style={styles.progressContainer}>
                <TouchableOpacity
                    style={styles.progressStep}
                    onPress={() => handleStepClick(1)}
                >
                    <View style={[styles.progressStepCircle, getStepStyle(1)]}>
                        <Text style={styles.progressStepText}>1</Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.progressLine, getLineStyle(1)]} />

                <TouchableOpacity
                    style={styles.progressStep}
                    onPress={() => handleStepClick(2)}
                >
                    <View style={[styles.progressStepCircle, getStepStyle(2)]}>
                        <Text style={styles.progressStepText}>2</Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.progressLine, getLineStyle(2)]} />

                <TouchableOpacity
                    style={styles.progressStep}
                    onPress={() => handleStepClick(3)}
                >
                    <View style={[styles.progressStepCircle, getStepStyle(3)]}>
                        <Text style={styles.progressStepText}>3</Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.progressLine, getLineStyle(3)]} />

                <TouchableOpacity
                    style={styles.progressStep}
                    onPress={() => handleStepClick(4)}
                >
                    <View style={[styles.progressStepCircle, getStepStyle(4)]}>
                        <Text style={styles.progressStepText}>4</Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.progressLine, getLineStyle(4)]} />

                <TouchableOpacity
                    style={styles.progressStep}
                    onPress={() => handleStepClick(5)}
                >
                    <View style={[styles.progressStepCircle, getStepStyle(5)]}>
                        <Text style={styles.progressStepText}>5</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.stepLabelContainer}>
                <Text style={styles.currentStepLabel}>
                    {view === "Basic Information" ? "Basic Information" :
                        view === "Terms" ? "Terms" :
                            view === "Criteria" ? "Criteria" :
                                view === "Start & End Date" ? "Start & End Date" : "Review"}
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* <Text style={styles.viewTitle}>
                    {view === "Basic Information" && "Basic Information"}
                    {view === "Terms" && "Terms"}
                    {view === "Criteria" && "Criteria"}
                    {view === "Start & End Date" && "Start & End Date"}
                    {view === "Review" && "Review"}
                </Text> */}

                {view === "Basic Information" && (
                    <View>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter deal title"
                            placeholderTextColor="#666"
                            value={title}
                            onChangeText={handleTitleChange}
                        />
                        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Enter deal description"
                            placeholderTextColor="#666"
                            value={description}
                            onChangeText={handleDescriptionChange}
                            multiline
                        />
                        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

                        <Text style={styles.label}>Budget</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter budget amount"
                            placeholderTextColor="#666"
                            value={budget}
                            onChangeText={handleBudgetChange}
                            keyboardType="numeric"
                        />
                        {errors.budget ? <Text style={styles.errorText}>{errors.budget}</Text> : null}

                        <Text style={styles.label}>Rank</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowRankDropdown(true)}
                        >
                            <Text style={{ color: rank ? '#FFFFFF' : '#666' }}>
                                {rank || "Select rank"}
                            </Text>
                        </TouchableOpacity>
                        {errors.rank ? <Text style={styles.errorText}>{errors.rank}</Text> : null}

                        <Modal
                            visible={showRankDropdown}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowRankDropdown(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowRankDropdown(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Rank</Text>
                                    {rankOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.optionItem}
                                            onPress={() => handleRankSelect(option)}
                                        >
                                            <Text style={styles.optionText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        </Modal>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleContinueBasicInformation}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {view === "Terms" && (
                    <View>
                        <Text style={styles.label}>Payment Terms</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Enter payment terms"
                            placeholderTextColor="#666"
                            value={payement_terms}
                            onChangeText={handleTermsChange}
                            multiline
                        />
                        {errors.payement_terms ? <Text style={styles.errorText}>{errors.payement_terms}</Text> : null}

                        <Text style={[styles.label, { marginTop: currentTheme.spacing.medium }]}>Terms</Text>
                        {terms.map((term, index) => (
                            <View key={index} style={styles.termContainer}>
                                <View style={styles.termHeader}>
                                    <Text style={styles.termLabel}>Term {index + 1}</Text>
                                    {terms.length > 3 && (
                                        <TouchableOpacity onPress={() => handleRemoveTerm(index)}>
                                            <Ionicons name="close-circle" size={24} color="#ffffff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Term ${index + 1} title`}
                                    placeholderTextColor="#666"
                                    value={term.title}
                                    onChangeText={(text) => handleTermTitleChange(text, index)}
                                />
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder={`Term ${index + 1} description (optional)`}
                                    placeholderTextColor="#666"
                                    value={term.description}
                                    onChangeText={(text) => handleTermDescriptionChange(text, index)}
                                    multiline
                                />
                                {errors[`term_${index}`] ? <Text style={styles.errorText}>{errors[`term_${index}`]}</Text> : null}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addTermButton}
                            onPress={handleAddTerm}
                        >
                            <View style={styles.plusButtonContainer}>
                                <Ionicons name="add" size={24} color={currentTheme.colors.white} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleContinueTerms}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {view === "Criteria" && (
                    <View>
                        <Text style={styles.label}>Select Criteria (Multiple)</Text>
                        <View style={styles.criteriaContainer}>
                            {['Followers', 'Views', 'Posts'].map((criteriaName) => (
                                <TouchableOpacity
                                    key={criteriaName}
                                    style={[
                                        styles.criteriaButton,
                                        selectedCriteria.includes(criteriaName) && styles.criteriaButtonActive
                                    ]}
                                    onPress={() => {
                                        if (selectedCriteria.includes(criteriaName)) {
                                            setSelectedCriteria(selectedCriteria.filter(c => c !== criteriaName));
                                            const newSubCriteria = { ...selectedSubCriteria };
                                            delete newSubCriteria[criteriaName];
                                            setSelectedSubCriteria(newSubCriteria);
                                        } else {
                                            setSelectedCriteria([...selectedCriteria, criteriaName]);
                                        }
                                    }}
                                >
                                    <Text style={styles.criteriaButtonText}>{criteriaName}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {selectedCriteria.map((criteria) => (
                            <View key={criteria} style={styles.criteriaSectionContainer}>
                                <Text style={styles.label}>Select {criteria} Range</Text>
                                <View style={styles.criteriaContainer}>
                                    {getSubCriteriaOptions(criteria).map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.criteriaButton,
                                                selectedSubCriteria[criteria] === option && styles.criteriaButtonActive
                                            ]}
                                            onPress={() => setSelectedSubCriteria({
                                                ...selectedSubCriteria,
                                                [criteria]: option
                                            })}
                                        >
                                            <Text style={styles.criteriaButtonText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                        {errors.criteria ? <Text style={styles.errorText}>{errors.criteria}</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, { marginTop: 32 }]}
                            onPress={handleContinueCriteria}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {view === "Start & End Date" && (
                    <View>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {start_date ? start_date : "Select Start Date"}
                            </Text>
                        </TouchableOpacity>
                        {errors.start_date ? <Text style={styles.errorText}>{errors.start_date}</Text> : null}

                        {showStartDatePicker && (
                            <DateTimePicker
                                value={start_date ? new Date(start_date) : new Date()}
                                mode="date"
                                display="default"
                                onChange={handleStartDateChange}
                            />
                        )}

                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {end_date ? end_date : "Select End Date"}
                            </Text>
                        </TouchableOpacity>
                        {errors.end_date ? <Text style={styles.errorText}>{errors.end_date}</Text> : null}

                        {showEndDatePicker && (
                            <DateTimePicker
                                value={end_date ? new Date(end_date) : new Date()}
                                mode="date"
                                display="default"
                                onChange={handleEndDateChange}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleContinueDatetime}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {view === "Review" && (
                    <View>
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Basic Information</Text>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Title</Text>
                                <Text style={styles.reviewValue}>{title}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Description</Text>
                                <Text style={styles.reviewValue}>{description}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Budget</Text>
                                <Text style={styles.reviewValue}>${budget}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Rank</Text>
                                <Text style={styles.reviewValue}>{rank}</Text>
                            </View>
                        </View>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Terms</Text>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Payment Terms</Text>
                                <Text style={styles.reviewValue}>{payement_terms}</Text>
                            </View>
                            {terms.filter(term => term.title.trim()).map((term, index) => (
                                <View key={index} style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Term {index + 1}</Text>
                                    <Text style={styles.reviewValue}>{term.title}</Text>
                                    <Text style={styles.reviewDescription}>{term.description}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Criteria</Text>
                            {selectedCriteria.map((criteria) => (
                                <View key={criteria} style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>{criteria} Requirement</Text>
                                    <Text style={styles.reviewValue}>{selectedSubCriteria[criteria]}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewSectionTitle}>Dates</Text>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>Start Date</Text>
                                <Text style={styles.reviewValue}>{start_date}</Text>
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={styles.reviewLabel}>End Date</Text>
                                <Text style={styles.reviewValue}>{end_date}</Text>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.editButton]}
                                onPress={() => setView("Basic Information")}
                            >
                                <Text style={styles.buttonText}>Edit Deal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.postButton]}
                                onPress={handlePostDeal}
                            >
                                <Text style={styles.buttonText}>Post Deal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default AddDeal;
