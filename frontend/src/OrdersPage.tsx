
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Container, Title, Table, Loader, Alert, Group, Paper, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import EditOrderModal from './EditOrderModal';
import UploadPdfButton from './UploadPdfButton';
import CreateOrderModal from './CreateOrderModal';
// Helper functions for REST API actions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const viewOrder = async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`);
  const data = await res.json();
  alert(`Order details:\nID: ${data.id}\nName: ${data.patient_first_name} ${data.patient_last_name}\nDOB: ${data.patient_dob}`);
};


// Modal state for editing
const useEditOrderModal = () => {
  const [opened, setOpened] = React.useState(false);
  const [order, setOrder] = React.useState<Order | null>(null);
  const open = (order: Order) => {
    setOrder(order);
    setOpened(true);
  };
  const close = () => setOpened(false);
  return { opened, order, open, close };
};

const deleteOrder = async (id: number) => {
  if (!window.confirm('Are you sure you want to delete this order?')) return;
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('Order deleted!');
    window.location.reload(); // For demo, reload to refresh list
  } else {
    alert('Failed to delete order');
  }
};

type Order = {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_dob: string;
};


const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${API_BASE_URL}/orders`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};


const OrdersPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    initialData: [],
  });
  const editModal = useEditOrderModal();

  const handleEditClick = (order: Order) => {
    editModal.open(order);
  };

  const handleSave = async (updatedOrder: Order) => {
    await fetch(`${API_BASE_URL}/orders/${updatedOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder),
    });
    refetch();
  };

  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/orders/upload_pdf`, {
      method: 'POST',
      body: formData,
    });
    setUploading(false);
    setFile(null);
    if (res.ok) {
      alert('PDF uploaded and processed!');
      refetch();
    } else {
      alert('Failed to upload PDF');
    }
  };

  // State for create order modal
  const [createOpened, setCreateOpened] = React.useState(false);

  const handleCreateOrder = async (order: {
    patient_first_name: string;
    patient_last_name: string;
    patient_dob: string;
  }) => {
    await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    refetch();
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="xs" p="md" radius="md">
        <Group mb="md" justify="space-between">
          <Title order={2}>Orders</Title>
          <Group>
            <Button onClick={() => setCreateOpened(true)} variant="filled" color="blue">
              Create Order
            </Button>
            <UploadPdfButton
              uploading={uploading}
              file={file}
              setFile={setFile}
              handleUpload={handleUpload}
            />
          </Group>
        </Group>
        {isLoading ? (
          <Loader variant="dots" />
        ) : error ? (
          <Alert color="red" title="Error" mb="md">
            Error loading orders.
          </Alert>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Patient Name</Table.Th>
                  <Table.Th>Date of Birth</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(data! as Order[]).map((order: Order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>{order.id}</Table.Td>
                    <Table.Td>{order.patient_first_name} {order.patient_last_name}</Table.Td>
                    <Table.Td>{order.patient_dob}</Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Tooltip label="View">
                          <ActionIcon color="blue" variant="light" size="sm" onClick={() => viewOrder(order.id)}>
                            <IconEye size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon color="orange" variant="light" size="sm" onClick={() => handleEditClick(order)}>
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon color="red" variant="light" size="sm" onClick={() => deleteOrder(order.id)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        <EditOrderModal
          opened={editModal.opened}
          onClose={editModal.close}
          order={editModal.order}
          onSave={handleSave}
        />
        <CreateOrderModal
          opened={createOpened}
          onClose={() => setCreateOpened(false)}
          onCreate={handleCreateOrder}
        />
      </Paper>
    </Container>
  );
};

export default OrdersPage;
