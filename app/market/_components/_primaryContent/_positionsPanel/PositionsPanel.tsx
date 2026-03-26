"use client"

import { usePositions } from "./hooks/usePositions";
import { PositionsTabs } from "./_positionsTabs/PositionsTabs";
import { PositionsTable } from "./_positionsTable/PositionsTable";
import EditOrderModal from "./_editOrderModal/EditOrderModal";

export default function PositionsPanel() {

    const {
        activeTab,
        orders,
        visibleOrders,
        tickersData,
        isLoading,
        isEditModalOpen,
        editingOrder,
        setActiveTab,
        setIsEditModalOpen,
        handleClose,
        openEditModal,
        handleSaveEdit
    } = usePositions();

    return (
        <div className="flex flex-col h-full bg-card/30 text-sm font-sans relative">
            <PositionsTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                orders={orders}
            />
            <PositionsTable
                orders={visibleOrders}
                activeTab={activeTab}
                tickersData={tickersData}
                isLoading={isLoading}
                onClose={handleClose}
                onEdit={openEditModal}
            />
            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                order={editingOrder}
                onSave={handleSaveEdit}
            />
        </div>
    );
}