import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import InputMask from 'react-input-mask';
import { db } from '../firebaseConfig';
import { differenceInYears } from 'date-fns'; // Importando a função para calcular a diferença em anos
import './ConsultaMedica.css';

const hoje = new Date();

const dia = hoje.getDate().toString().padStart(2, '0'); // Obtém o dia do mês com dois dígitos
const mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Obtém o mês (adiciona 1 porque Janeiro é 0)
const ano = hoje.getFullYear(); // Obtém o ano com quatro dígitos

const dataFormatada = `${dia}/${mes}/${ano}`;

const calcularIdade = (dataNascimento) => {
  const hoje = new Date(); // Obtém a data de hoje
  const idade = differenceInYears(hoje, new Date(dataNascimento));
  return idade;
};

const ConsultaMedica = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    idade: '',
    altura: '',
    peso: '',
    sexo: '',
    queixa: '',
    doencas: '',
    historicoFamiliar: '',
    medicamentos: '',
    cirurgias: '',
    fuma: '',
    bebe: '',
    atividadeFisica: '',
    doresPeito:'',
    desmaio:'',
    vacinacao:'',
    alergia:'',
    conclusao: '',
    receituario: '',
    nomeMedico:'',
    crmMedico: '',
    especialidade: '',
    observacoes: '',
    dataConsulta: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'cpf' && value.length === 14) { // CPF length with mask
      try {
        const pacientesQuery = query(collection(db, "pacientes"), where("cpf", "==", value));
        const querySnapshot = await getDocs(pacientesQuery);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const patientData = doc.data();
            setFormData({
              ...formData,
              nome: patientData.nome,
              idade: calcularIdade(patientData.nascimento),
              sexo: patientData.sexo,
              cpf: value // Keep the CPF value as it is
            });
          });
        }
      } catch (error) {
        console.error("Erro ao buscar paciente: ", error);
      }
    }
    
    if (name === 'crmMedico' && value.length === 6) { // Tamanho do CRM em caracteres
      try {
        const funcionariosQuery = query(collection(db, "funcionarios"), where("crm", "==", value));
        const querySnapshot = await getDocs(funcionariosQuery);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const medicoData = doc.data();
            setFormData({
              ...formData,
              nomeMedico: medicoData.nome,
              especialidade: medicoData.especialidade,
              crmMedico: value,
            });
          });
        }
      } catch (error) {
        console.error("Erro ao buscar paciente: ", error);
      }
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (!formData[key]) {
        tempErrors[key] = 'Este campo é obrigatório';
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        await addDoc(collection(db, "consultasMedicas"), formData);
        alert('Consulta enviada com sucesso!');
        setFormData({
          nome: '',
          cpf: '',
          idade: '',
          altura: '',
          peso: '',
          sexo: '',
          queixa: '',
          doencas: '',
          historicoFamiliar: '',
          medicamentos: '',
          cirurgias: '',
          fuma: '',
          bebe: '',
          atividadeFisica: '',
          doresPeito:'',
          desmaio:'',
          vacinacao:'',
          alergia:'',
          conclusao: '',
          receituario: '',
          crmMedico: '',
          nomeMedico:'',
          especialidade: '',
          observacoes: '',
          dataConsulta: '',
        });
      } catch (error) {
        console.error('Erro ao enviar consulta: ', error);
        alert('Erro ao enviar consulta');
      }
    }
  };

  return (
    <div className="container">
                  <div className="cadPaciente-title1" style={{ marginTop: '-20px' }}>
                <h2>Consulta Médica
                </h2>
            </div>
      <div className="cadPaciente-form-body-container">
      <h3 className="form-header">Informações básicas do paciente</h3>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-row">
          <div className="form-group">
            <label>CPF:</label>
            <InputMask mask="999.999.999-99" type="text" name="cpf" value={formData.cpf} onChange={handleChange} />
            {errors.cpf && <span className="error">{errors.cpf}</span>}
          </div>
          <div className="form-group">
            <label>Nome:</label>
            <input type="text" name="nome"  value={formData.nome} onChange={handleChange} disabled />
            {errors.nome && <span className="error">{errors.nome}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Idade:</label>
            <input type="text" name="idade" value={formData.idade} onChange={handleChange} disabled />
            {errors.idade && <span className="error">{errors.idade}</span>}
          </div>
          <div className="form-group">
            <label>Altura:</label>
            <InputMask mask="9.99m" type="text" name="altura" value={formData.altura} onChange={handleChange} />
            {errors.altura && <span className="error">{errors.altura}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Peso:</label>
            <InputMask mask="999kg" type='text' name="peso" value={formData.peso} onChange={handleChange}/>
            {errors.peso && <span className="error">{errors.peso}</span>}
          </div>
          <div className="form-group">
            <label>Sexo:</label>
            <input type="text" name="sexo" value={formData.sexo.toUpperCase()} onChange={handleChange} disabled />
            {errors.sexo && <span className="error">{errors.sexo}</span>}
          </div>
        </div>
        </form>
        </div>
        <div className="cadPaciente-form-body-container">
        <h3 className="form-header">Informações do Médico</h3>
        <form onSubmit={handleSubmit} className="form-body">
        <div className="form-row">
          <div className="form-group">
            <label style={{ textAlign: "center" }}>CRM Médico:</label>
            <InputMask  mask="999999" type="text" name="crmMedico" value={formData.crmMedico} onChange={handleChange} />
            {errors.crmMedico && <span className="error">{errors.crmMedico}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Nome do Médico:</label>
            <input type="text" placeholder="Preencha o nome do médico" name="nomeMedico" value={formData.nomeMedico} onChange={handleChange} />
            {errors.nomeMedico && <span className="error">{errors.nomeMedico}</span>}
          </div>
          <div className="form-group">
            <label>Especialidade:</label>
            <select name="especialidade" value={formData.especialidade} onChange={handleChange}>
              <option value="">Selecione uma especialidade</option>
              <option value="Clínico Geral">Clínico Geral</option>
              <option value="Pediatria">Pediatria</option>
              <option value="Cardiologia">Cardiologia</option>
            </select>
            {errors.especialidade && <span className="error">{errors.especialidade}</span>}
          </div>
        </div>
        </form>
        </div>
        <div className="cadPaciente-form-body-container">
        <h3 className="form-header">Anamnese</h3>
        <form onSubmit={handleSubmit} className="form-body">
        <div className="form-row">
          <div className="form-group">
            <label>Queixa:</label>
            <input type="text" placeholder="Pergunte as queixas do paciente" name="queixa" value={formData.queixa} onChange={handleChange} />
            {errors.queixa && <span className="error">{errors.queixa}</span>}
          </div>
          <div className="form-group">
            <label>Doenças:</label>
            <input type="text" placeholder="Verifique se o paciente possui alguma doença" name="doencas" value={formData.doencas} onChange={handleChange} />
            {errors.doencas && <span className="error">{errors.doencas}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Histórico Familiar:</label>
            <input type="text" placeholder="Verifique se há algum histórico familiar relevante" name="historicoFamiliar" value={formData.historicoFamiliar} onChange={handleChange} />
            {errors.historicoFamiliar && <span className="error">{errors.historicoFamiliar}</span>}
          </div>
          <div className="form-group">
            <label>Medicamentos:</label>
            <input type="text" placeholder="O paciente toma algum medicamento contínuo ?" name="medicamentos" value={formData.medicamentos} onChange={handleChange} />
            {errors.medicamentos && <span className="error">{errors.medicamentos}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Cirurgias:</label>
            <input type="text" placeholder="Pergunte se o paciente já fez cirurgia" name="cirurgias" value={formData.cirurgias} onChange={handleChange} />
            {errors.cirurgias && <span className="error">{errors.cirurgias}</span>}
          </div>
          <div className="form-group">
            <label>Fuma:</label>
            <select name="fuma" value={formData.fuma} onChange={handleChange}>
              <option value="">Selecione a resposta</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            {errors.fuma && <span className="error">{errors.fuma}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Bebe:</label>
            <select name="bebe" value={formData.bebe} onChange={handleChange}>
              <option value="">Selecione a resposta</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            {errors.bebe && <span className="error">{errors.bebe}</span>}
          </div>
          <div className="form-group">
            <label>Atividade Física:</label>
            <input type="text" placeholder="Verifique se o paciente pratica atividade física" name="atividadeFisica" value={formData.atividadeFisica} onChange={handleChange} />
            {errors.atividadeFisica && <span className="error">{errors.atividadeFisica}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Sente dores no peito?</label>
            <select name="doresPeito" value={formData.doresPeito} onChange={handleChange}>
              <option value="">Selecione a resposta</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select> 
            {errors.doresPeito && <span className="error">{errors.doresPeito}</span>}
          </div>
          <div className="form-group">
            <label>Já sofreu desmaio?</label>
            <select name="desmaio" value={formData.desmaio} onChange={handleChange}>
              <option value="">Selecione a resposta</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select> 
            {errors.desmaio && <span className="error">{errors.desmaio}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Está com a vacinação em dia?</label>
            <select name="vacinacao" value={formData.vacinacao} onChange={handleChange}>
              <option value="">Selecione a resposta</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select> 
            {errors.vacinacao && <span className="error">{errors.vacinacao}</span>}
          </div>
          <div className="form-group">
            <label>Sofre de alguma alergia aguda?</label>
            <select name="alergia" value={formData.alergia} onChange={handleChange}>
              <option value="">Selecione a resposta</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select> 
            {errors.alergia && <span className="error">{errors.alergia}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label style={{ textAlign: "center" }}>Observações Adicionais:</label>
            <textarea name="observacoes" placeholder="Inclua todas as observações relevantes informadas pelo paciente" value={formData.observacoes} style={{ width: "100%", height: "100px" }} onChange={handleChange} />
            {errors.observacoes && <span className="error">{errors.observacoes}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Conclusão:</label>
            <input type="text" name="conclusao" value={formData.conclusao} onChange={handleChange} />
            {errors.conclusao && <span className="error">{errors.conclusao}</span>}
          </div>
          <div className="form-group">
            <label>Receituário:</label>
            <input type="text" name="receituario" value={formData.receituario} onChange={handleChange} />
            {errors.receituario && <span className="error">{errors.receituario}</span>}
          </div>
        </div>
        <div className="form-group">
          <label style={{ textAlign: 'center' }}>Data da consulta:</label>
          <div className="form-row">
            <input type="date" name="dataConsulta" value={formData.dataConsulta} style={{ width: '100%', textAlign: "center" }} onChange={handleChange} />
          </div>
        </div>

        <div className="btn-container">
          <button type="submit" className="btn" style={{ width: "100%", height: "100%" }}>Enviar Consulta</button>
        </div>

        </form>
        </div>
    </div>
  );
};

export default ConsultaMedica;
