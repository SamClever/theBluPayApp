import React, { useState, FC } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { COLORS } from '../constants';

const error = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

interface DatePickerModalProps {
  open: boolean;
  startDate: string;
  selectedDate: string;
  onClose: () => void;
  onChangeStartDate: (date: string) => void;
}

const DatePickerModal: FC<DatePickerModalProps> = ({
  open,
  startDate,
  selectedDate,
  onClose,
  onChangeStartDate,
}) => {
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const handleConfirm = () => {
    // Format date as YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChangeStartDate(formatted);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <DatePicker
            date={date}
            onDateChange={setDate}
            mode="date"
            locale="en"
            minimumDate={startDate ? new Date(startDate) : undefined}
          />
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
            <Text style={[{ color: 'white', fontWeight: 'bold' }, styles.latinFont]}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[{ color: 'white' }, styles.latinFont]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 35,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  // Add a font override for all text in the modal
  latinFont: {
    fontFamily: 'Roboto', // or 'sans-serif' for Android fallback
  },
});

export default DatePickerModal;