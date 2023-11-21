import React, { useState } from "react";
import ReactSelect from "react-select";

const PlanProcedureItem = ({
  procedure,
  users,
  handleAddUserToPlanProc,
  selectedUsers = [],
}) => {
  const handleAssignUserToProcedure = (procedure, e) => {
    const addedSelection = e.find(
      (x) => !selectedUsers.some((s) => s.userId == x.value)
    );
    const addedUser = users.find((u) => u.userId == addedSelection.value);
    handleAddUserToPlanProc(procedure, addedUser);
  };

  const allUsersMap = users.map((u) => ({
    label: u.name,
    value: u.userId,
  }));

  const selectedUsersMap = selectedUsers.map((u) => ({
    label: u.name,
    value: u.userId,
  }));

  return (
    <div className="py-2">
      <div>{procedure.procedureTitle}</div>

      <ReactSelect
        className="mt-2"
        placeholder="Select User to Assign"
        isMulti={true}
        options={allUsersMap}
        value={selectedUsersMap}
        onChange={(e) => handleAssignUserToProcedure(procedure, e)}
      />
    </div>
  );
};

export default PlanProcedureItem;
