import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from "../theme/ThemeContext";
import api from "../config/axios";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AddDeal = () => {
    const { currentTheme } = useTheme();
    const navigation = useNavigation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(0);
    const [terms, setTerms] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");

    const [view, setView] = useState("Basic Information");

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        budget: '',
        terms: '',
        start_date: '',
        end_date: ''
    });

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleTitleChange = (text: string) => {
        setTitle(text);
    }

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
    }

    const handleBudgetChange = (text: number) => {
        setBudget(text);
    }

    const handleTermsChange = (text: string) => {
        setTerms(text);
    }

    const handleContinueBasicInformation = () => {
        if (title && description && budget > 0) {
            setView("Terms");
        }
    }

    const handleContinueTerms = () => {
        if (terms) {
            setView("Start & End Date");
        }
    }

    const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate.toISOString().split('T')[0]);
        }
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

        if (!budget || budget <= 0) {
            newErrors.budget = 'Valid budget is required';
            isValid = false;
        }

        if (!terms.trim()) {
            newErrors.terms = 'Terms are required';
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
            const response = await api.post("/addDeal", {
                title,
                description,
                budget,
                terms,
                start_date,
                end_date
            });
            console.log(response.data);
            // Add success handling here (e.g., navigation or success message)
        } catch (error) {
            console.error('Error posting deal:', error);
            // Add error handling here (e.g., error message to user)
        }
    }

    const handleGoBack = () => {
        if (view === "Terms") {
            setView("Basic Information");
        } else if (view === "Start & End Date") {
            setView("Terms");
        }
        if (view === "Basic Information") {
            navigation.navigate("Home" as never);
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

    return (
        <View style={styles.container}>
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

            {view === "Basic Information" && (
                <>
                    <Text style={styles.viewTitle}>{view}</Text>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter title..."
                        placeholderTextColor={currentTheme.colors.textSecondary}
                        onChangeText={handleTitleChange}
                        value={title}
                    />
                    {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        placeholder="Enter description..."
                        placeholderTextColor={currentTheme.colors.textSecondary}
                        onChangeText={handleDescriptionChange}
                        value={description}
                        multiline
                    />
                    {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

                    <Text style={styles.label}>Budget</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter budget..."
                        placeholderTextColor={currentTheme.colors.textSecondary}
                        onChangeText={(text) => handleBudgetChange(Number(text))}
                        keyboardType="numeric"
                        value={budget.toString()}
                    />
                    {errors.budget ? <Text style={styles.errorText}>{errors.budget}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleContinueBasicInformation}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </>
            )}

            {view === "Terms" && (
                <>
                    <Text style={styles.viewTitle}>{view}</Text>
                    <Text style={styles.label}>Terms</Text>
                    <TextInput
                        style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
                        placeholder="Enter terms..."
                        placeholderTextColor={currentTheme.colors.textSecondary}
                        onChangeText={handleTermsChange}
                        value={terms}
                        multiline
                    />
                    {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleContinueTerms}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </>
            )}

            {view === "Start & End Date" && (
                <>
                    <Text style={styles.viewTitle}>{view}</Text>

                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            {start_date || "Select Start Date"}
                        </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={start_date ? new Date(start_date) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleStartDateChange}
                        />
                    )}
                    {errors.start_date ? <Text style={styles.errorText}>{errors.start_date}</Text> : null}

                    <Text style={styles.label}>End Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            {end_date || "Select End Date"}
                        </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                        <DateTimePicker
                            value={end_date ? new Date(end_date) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleEndDateChange}
                            minimumDate={start_date ? new Date(start_date) : undefined}
                        />
                    )}
                    {errors.end_date ? <Text style={styles.errorText}>{errors.end_date}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handlePostDeal}>
                        <Text style={styles.buttonText}>Post Deal</Text>
                    </TouchableOpacity>
                    <Text style={styles.continueText}>By Continuing, you agree to the Sponsofy's Terms & Conditions</Text>
                </>
            )}
        </View>
    );
};

export default AddDeal;
