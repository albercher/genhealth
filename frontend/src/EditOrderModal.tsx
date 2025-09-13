import React, { useState } from 'react';
import { Modal, Button, TextInput, Group } from '@mantine/core';

export type EditOrderModalProps = {
  opened: boolean;
  onClose: () => void;
  order: {
    id: number;
    patient_first_name: string;
    patient_last_name: string;
    patient_dob: string;
  } | null;
  onSave: (order: {
    id: number;
    patient_first_name: string;
    patient_last_name: string;
    patient_dob: string;
  }) => void;
};

const EditOrderModal: React.FC<EditOrderModalProps> = ({ opened, onClose, order, onSave }) => {
  const [firstName, setFirstName] = useState(order?.patient_first_name || '');
  const [lastName, setLastName] = useState(order?.patient_last_name || '');
  const [dob, setDob] = useState(order?.patient_dob || '');
  const [dobError, setDobError] = useState<string | null>(null);

  React.useEffect(() => {
    setFirstName(order?.patient_first_name || '');
    setLastName(order?.patient_last_name || '');
    setDob(order?.patient_dob || '');
  }, [order]);

  if (!order) return null;

  const validateDob = (value: string) => {
    // Accepts YYYY-MM-DD format
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  const handleSave = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedDob = dob.trim();
    if (!validateDob(trimmedDob)) {
      setDobError('Date of birth must be in YYYY-MM-DD format');
      return;
    }
    setDobError(null);
    onSave({
      id: order.id,
      patient_first_name: trimmedFirstName,
      patient_last_name: trimmedLastName,
      patient_dob: trimmedDob,
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Edit Order #${order.id}`} centered>
      <TextInput label="First Name" value={firstName} onChange={e => setFirstName(e.currentTarget.value)} mb="sm" />
      <TextInput label="Last Name" value={lastName} onChange={e => setLastName(e.currentTarget.value)} mb="sm" />
      <TextInput
        label="Date of Birth"
        value={dob}
        onChange={e => setDob(e.currentTarget.value)}
        mb="sm"
        error={dobError}
        placeholder="YYYY-MM-DD"
      />
      <Group mt="md" justify="flex-end">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="default" onClick={onClose}>Cancel</Button>
      </Group>
    </Modal>
  );
};

export default EditOrderModal;
