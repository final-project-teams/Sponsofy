import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
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

    const [view, setView] = useState<"Basic Information" | "Terms" | "Start & End Date" | "Review">("Basic Information");

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        budget: '',
        terms: '',
        payement_terms: '',
        start_date: '',
        end_date: '',
        rank: ''
    });

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const rankOptions = ['plat', 'gold', 'silver'];

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
        const newErrors: { [key: string]: string } = {};

        if (!payement_terms) {
            newErrors.payement_terms = "Payment terms are required";
        }

        // Validate each term
        terms.forEach((term, index) => {
            if (!term.title) {
                newErrors[`term_${index}`] = `Term ${index + 1} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Continue to next step
        setView("Start & End Date");
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
        const newErrors: { [key: string]: string } = {};

        if (!start_date) {
            newErrors.start_date = "Start date is required";
        }
        if (!end_date) {
            newErrors.end_date = "End date is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setView("Review");
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
            const userString = await AsyncStorage.getItem('user');
            let userData = null;

            if (userString) {
                userData = JSON.parse(userString);
                console.log("User data found:", userData);
            } else {
                console.log("User not found in storage, proceeding with deal creation anyway");
            }

            const dealData = {
                title: title,
                description: description,
                budget: parseFloat(budget),
                payement_terms: payement_terms,
                start_date: start_date,
                end_date: end_date,
                rank: rank,
                user_id: userData?.id || null,
                termsList: terms.filter(term => term.title.trim() !== '') // Only send terms with non-empty titles
            };

            console.log("Posting deal data:", dealData);

            const response = await api.post("/addDeal", dealData);

            console.log("Deal created successfully:", response.data);

            navigation.navigate("Home" as never);

        } catch (error) {
            console.error('Error posting deal:', error);
        }
    };

    const handleGoBack = () => {
        if (view === "Terms") {
            setView("Basic Information");
        } else if (view === "Start & End Date") {
            setView("Terms");
        }
    };

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
            marginBottom: 40,
            marginTop: 20,
            paddingHorizontal: 50,
        },
        progressStep: {
            width: 58,
            height: 58,
            borderRadius: 30,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#ffffff',
        },
        progressStepActive: {
            backgroundColor: '#8B5CF6',
            borderColor: '#8B5CF6',
        },
        progressStepCompleted: {
            backgroundColor: '#8B5CF6',
            borderColor: '#8B5CF6',
        },
        progressStepText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        progressStepTextActive: {
            color: '#ffffff',
        },
        progressLine: {
            flex: 1,
            height: 8,
            backgroundColor: '#4B5563',
            marginHorizontal: 0,
        },
        progressLineActive: {
            backgroundColor: '#8B5CF6',
        },
        backButton: {
            position: 'absolute',
            left: 20,
            top: 56,
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
    });

    const getStepStyle = (stepNumber: number) => {
        const currentStep = view === "Basic Information" ? 1 : view === "Terms" ? 2 : 3;
        return [
            styles.progressStep,
            stepNumber === currentStep && styles.progressStepActive,
            stepNumber < currentStep && styles.progressStepCompleted,
        ];
    };

    const getStepTextStyle = (stepNumber: number) => {
        const currentStep = view === "Basic Information" ? 1 : view === "Terms" ? 2 : 3;
        return [
            styles.progressStepText,
            (stepNumber === currentStep || stepNumber < currentStep) && styles.progressStepTextActive,
        ];
    };

    const getLineStyle = (lineNumber: number) => {
        const currentStep = view === "Basic Information" ? 1 : view === "Terms" ? 2 : 3;
        return [
            styles.progressLine,
            lineNumber < currentStep && styles.progressLineActive,
        ];
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

    return (
        <View style={styles.container}>
            {view !== "Basic Information" && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="#ffffff"
                    />
                </TouchableOpacity>
            )}
            <View style={styles.progressContainer}>
                <View style={getStepStyle(1)}>
                    <Text style={getStepTextStyle(1)}>1</Text>
                </View>
                <View style={getLineStyle(1)} />
                <View style={getStepStyle(2)}>
                    <Text style={getStepTextStyle(2)}>2</Text>
                </View>
                <View style={getLineStyle(2)} />
                <View style={getStepStyle(3)}>
                    <Text style={getStepTextStyle(3)}>3</Text>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <Text style={styles.viewTitle}>
                    {view === "Basic Information" && "Basic Information"}
                    {view === "Terms" && "Terms"}
                    {view === "Start & End Date" && "Start & End Date"}
                    {view === "Review" && "Review"}
                </Text>

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
