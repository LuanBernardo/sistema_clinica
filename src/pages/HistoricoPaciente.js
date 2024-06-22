// src/pages/HistoricoPaciente.js
import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './HistoricoPaciente.css';
import InputMask from 'react-input-mask';

const HistoricoPaciente = () => {
  const [cpf, setCpf] = useState('');
  const [dados, setDados] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleChange = (e) => {
    setCpf(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "consultasMedicas"), where("cpf", "==", cpf));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => doc.data());
      setDados(docs);
      if (docs.length === 0) {
        setFeedbackMessage({ type: 'error', text: "Nenhum histórico encontrado para o CPF fornecido." });
      } else {
        setFeedbackMessage({ type: 'success', text: "Histórico encontrado com sucesso." });
      }
    } catch (error) {
      console.error("Erro ao buscar histórico: ", error);
      setFeedbackMessage({ type: 'error', text: "Erro ao buscar histórico" });
    }
  };

  return (
    <div className="container">
      <form className="historico-paciente-form" onSubmit={handleSubmit}>
        <h2 className="form-header">Histórico do Paciente</h2>
        <div className="form-body">
          <div className="form-group full-width">
            <label>CPF</label>
            <InputMask 
              mask="999.999.999-99" 
              name="cpf" 
              placeholder="Digite o CPF" 
              value={cpf} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="btn-container">
            <button type="submit" className="btn" style = {{width: "100%", height: "100%"}}>Buscar Histórico</button>
          </div>
        </div>
      </form>
      {feedbackMessage && (
        <div className={`feedback-message ${feedbackMessage.type}`}>
          {feedbackMessage.text}
        </div>
      )}
      <div className="historico-paciente-dados">
        {dados.length > 0 ? (
          dados.map((dado, index) => (
            <div key={index} className="historico-item form-body-container">
              <p><strong>Nome:</strong> {dado.nome}</p>
              <p><strong>CPF:</strong> {dado.cpf}</p>
              <p><strong>Data de Nascimento:</strong> {dado.dataNascimento}</p>
              <p><strong>Altura:</strong> {dado.altura}</p>
              <p><strong>Peso:</strong> {dado.peso}</p>
              <p><strong>Sexo:</strong> {dado.sexo}</p>
              <p><strong>Queixa:</strong> {dado.queixa}</p>
              <p><strong>Doenças:</strong> {dado.doencas}</p>
              <p><strong>Histórico Familiar:</strong> {dado.historicoFamiliar}</p>
              <p><strong>Medicamentos:</strong> {dado.medicamentos}</p>
              <p><strong>Cirurgias:</strong> {dado.cirurgias}</p>
              <p><strong>Fuma:</strong> {dado.fuma}</p>
              <p><strong>Bebe:</strong> {dado.bebe}</p>
              <p><strong>Atividade Física:</strong> {dado.atividadeFisica}</p>
            </div>
          ))
        ) : (
          <p>Nenhum histórico encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default HistoricoPaciente;