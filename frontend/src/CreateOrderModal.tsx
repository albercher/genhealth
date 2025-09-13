import React, { useState } from 'react';
import { Modal, Button, TextInput, Group } from '@mantine/core';

export type CreateOrderModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreate: (order: {
    patient_first_name: string;
    patient_last_name: string;
    patient_dob: string;
  }) => void;
};

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ opened, onClose, onCreate }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [dobError, setDobError] = useState<string | null>(null);

  const validateDob = (value: string) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  const handleCreate = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedDob = dob.trim();
    if (!validateDob(trimmedDob)) {
      setDobError('Date of birth must be in YYYY-MM-DD format');
      return;
    }
    setDobError(null);
    onCreate({
      patient_first_name: trimmedFirstName,
      patient_last_name: trimmedLastName,
      patient_dob: trimmedDob,
    });
    setFirstName('');
    setLastName('');
    setDob('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Order" centered>
      <TextInput label="First Name" value={firstName} onChange={e => setFirstName(e.currentTarget.value)} mb="sm" />
      <TextInput label="Last Name" value={lastName} onChange={e => setLastName(e.currentTarget.value)} mb="sm" />
      <TextInput label="Date of Birth" value={dob} onChange={e => setDob(e.currentTarget.value)} mb="sm" error={dobError} placeholder="YYYY-MM-DD" />
      <Group mt="md" justify="flex-end">
        <Button onClick={handleCreate}>Create</Button>
        <Button variant="default" onClick={onClose}>Cancel</Button>
      </Group>
    </Modal>
  );
};

export default CreateOrderModal;
