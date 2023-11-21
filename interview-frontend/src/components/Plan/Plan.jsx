import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  addProcedureToPlan,
  addUserToPlanProc,
  getPlanProcedures,
  getProcedures,
  getUsers,
} from "../../api/api";
import Layout from "../Layout/Layout";
import ProcedureItem from "./ProcedureItem/ProcedureItem";
import PlanProcedureItem from "./PlanProcedureItem/PlanProcedureItem";

const Plan = () => {
  let { id } = useParams();
  const [procedures, setProcedures] = useState([]);
  const [planProcedures, setPlanProcedures] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      var procedures = await getProcedures();
      var planProcedures = await getPlanProcedures(id);
      var users = await getUsers();

      setUsers(users);
      setProcedures(procedures);
      setPlanProcedures(planProcedures);
    })();
  }, [id]);

  const handleAddProcedureToPlan = async (procedure) => {
    const hasProcedureInPlan = planProcedures.some(
      (p) => p.procedureId === procedure.procedureId
    );
    if (hasProcedureInPlan) return;

    await addProcedureToPlan(id, procedure.procedureId);
    setPlanProcedures((prevState) => {
      return [
        ...prevState,
        {
          planId: id,
          procedureId: procedure.procedureId,
          procedure: {
            procedureId: procedure.procedureId,
            procedureTitle: procedure.procedureTitle,
          },
        },
      ];
    });
  };

  const handleAddUserToPlanProc = async (procedure, newUser) => {
    if (
      newUser === null ||
      newUser === undefined ||
      procedure === null ||
      procedure === undefined
    )
      return;

    await addUserToPlanProc(id, procedure.procedureId, newUser.userId);
    setPlanProcedures((prevState) => {
      let newState = [...prevState];
      let procIndex = newState.findIndex(
        (p) => p.procedureId == procedure.procedureId && p.planId == id
      );

      const existingUsers = newState[procIndex].users ?? [];
      newState[procIndex].users = [...existingUsers, newUser];

      return newState;
    });
  };

  return (
    <Layout>
      <div className="container pt-4">
        <div className="d-flex justify-content-center">
          <h2>OEC Interview Frontend</h2>
        </div>
        <div className="row mt-4">
          <div className="col">
            <div className="card shadow">
              <h5 className="card-header">Repair Plan</h5>
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <h4>Procedures</h4>
                    <div>
                      {procedures.map((p) => (
                        <ProcedureItem
                          key={p.procedureId}
                          procedure={p}
                          handleAddProcedureToPlan={handleAddProcedureToPlan}
                          planProcedures={planProcedures}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col">
                    <h4>Added to Plan</h4>
                    <div>
                      {planProcedures.map((p) => (
                        <PlanProcedureItem
                          key={p.procedure.procedureId}
                          procedure={p.procedure}
                          selectedUsers={p.users}
                          users={users}
                          handleAddUserToPlanProc={handleAddUserToPlanProc}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Plan;
