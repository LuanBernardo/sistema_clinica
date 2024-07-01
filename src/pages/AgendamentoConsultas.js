import './AgendamentoConsultas.css'; // CSS da página
import React, { useEffect, useState } from 'react'; // Manipulação de estados lógicos
import { Formik, Form, Field } from 'formik'; // Formulários
import { db } from '../firebaseConfig'; // Firebase Sync
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";  // Firebase CRUD
import InputMask from 'react-input-mask';

// Função para validar CPF
const validateCPF = (value) => {
    const cpf = value.replace(/[^\d]+/g, '');
    if (cpf === '' || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
};

// Função para formatar a data
const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

// Componente para buscar CPF
const CpfSearch = ({ cpf, handleChange, cpfStatusMessage, cpfStatusClass }) => {
    return (
        <div className="agendamentoConsulta-idPaciente">
            <div className="agendamentoConsulta-title1" style={{ marginTop: '-20px' }}>
                <h2>Agendamento de Consultas</h2>
            </div>
            <form className="agendamentoConsulta-form-group" style={{ width: "100%", alignItems: "center" }}>
                <InputMask
                    name="cpf"
                    placeholder="CPF do Cliente"
                    type="text"
                    value={cpf}
                    onChange={handleChange}
                    mask="999.999.999-99"
                    required
                />
            </form>
            {cpfStatusMessage && (
                <p className={`agendamentoConsulta-status-message ${cpfStatusClass}`}>{cpfStatusMessage}</p>
            )}
        </div>
    );
};

// Componente para formulário de consulta
const ConsultaForm = ({ handleSubmit, data, setData, hora, setHora, motivo, setMotivo, especialidade, setEspecialidade, formaPagamento, setFormaPagamento, isSubmitDisabled }) => {
    return (
        <form onSubmit={handleSubmit}>
            <div className="agendamentoConsulta-form-group">
                <label>Data</label>
                <input
                    type="date"
                    name="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                />
            </div>
            <div className="agendamentoConsulta-form-group">
                <label>Hora</label>
                <select
                    name="hora"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                >
                    <option value="">Escolha um Horário</option>
                    <option value="8:30">8:30</option>
                    <option value="9:00">9:00</option>
                    <option value="9:30">9:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                </select>
            </div>
            <div className="agendamentoConsulta-form-group">
                <label>Motivo</label>
                <textarea
                    name="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                ></textarea>
            </div>
            <div className="agendamentoConsulta-form-group">
                <label>Especialidade Desejada</label>
                <select
                    name="especialidade"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    required
                >
                    <option value="">Selecione</option>
                    <option value="Clínico Geral">Clínico Geral</option>
                    <option value="Pediatra">Pediatra</option>
                    <option value="Cardiologia">Cardiologia</option>
                </select>
            </div>
            <div className="agendamentoConsulta-form-group">
                <label>Forma de Pagamento</label>
                <select
                    name="formaPagamento"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    required
                >
                    <option value="">Selecione</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                </select>
            </div>
            <button
                type="submit"
                className="agendamentoConsulta-button"
                disabled={isSubmitDisabled}
                style={{
                    backgroundColor: isSubmitDisabled ? 'gray' : '',
                    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer'
                }}
            >
                Confirmar
            </button>
        </form>
    );
};

const AgendamentoConsultas = () => {
    const [cpf, setCpf] = useState('');
    const [result, setResult] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cpfStatusMessage, setCpfStatusMessage] = useState('Localize o cliente através do CPF.');
    const [cpfStatusClass, setCpfStatusClass] = useState('yellow');
    const [successMessage, setSuccessMessage] = useState('');

    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [motivo, setMotivo] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [especialidade, setEspecialidade] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            setCpfStatusMessage('');
            setCpfStatusClass('');
            try {
                const q = query(collection(db, "pacientes"), where("cpf", "==", cpf));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setUserData(querySnapshot.docs[0].data());
                    setCpfStatusMessage('CPF encontrado nos nossos registros.');
                    setCpfStatusClass('success');
                } else {
                    setUserData(null);
                    setCpfStatusMessage('CPF não encontrado nos nossos registros.');
                    setCpfStatusClass('error');
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
                setError("Error fetching document");
            } finally {
                setLoading(false);
            }
        };

        if (cpf.length === 14) {
            fetchUserData();
        }
    }, [cpf]);

    useEffect(() => {
        if (cpf && data && hora && motivo && formaPagamento && especialidade && userData) {
            setIsSubmitDisabled(false);
        } else {
            setIsSubmitDisabled(true);
        }
    }, [cpf, data, hora, motivo, formaPagamento, especialidade, userData]);

    const handleInputChange = (e) => {
        setCpf(e.target.value);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setCpf(value);
        if (value.length === 14) {
            setResult(validateCPF(value) ? 'CPF válido!' : 'CPF inválido!');
        } else {
            setResult('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataConsulta = new Date(data);
        dataConsulta.setHours(0, 0, 0, 0);

        if (dataConsulta < hoje) {
            alert('A data da consulta só é válida se for para um dia futuro.');
            return;
        }

        const consultaExistenteQuery = query(
            collection(db, "consultasAgendadas"),
            where("data", "==", data),
            where("hora", "==", hora),
            where("cpfConsulta", "==", userData.cpf)
        );
        const consultaExistenteSnapshot = await getDocs(consultaExistenteQuery);
        if (!consultaExistenteSnapshot.empty) {
            alert('Já existe uma consulta agendada para este paciente neste horário.'+'\nCaso deseje alterá-la, faça via o calendário de consultas.');
            return;
        }

        const consultaPorHorarioQuery = query(collection(db, "consultasAgendadas"), where("data", "==", data), where("hora", "==", hora));
        const consultaPorHorarioSnapshot = await getDocs(consultaPorHorarioQuery);
        if (consultaPorHorarioSnapshot.size >= 3) {
            alert('Todos os três médicos especialistas estão ocupados neste horário, escolha outro.');
            return;
        }

        const consultaPorEspecialidadeQuery = query(collection(db, "consultasAgendadas"), where("data", "==", data), where("hora", "==", hora), where("especialidade", "==", especialidade));
        const consultaPorEspecialidadeSnapshot = await getDocs(consultaPorEspecialidadeQuery);
        if (!consultaPorEspecialidadeSnapshot.empty) {
            alert(`Já existe uma consulta de ${especialidade} agendada para este horário.`);
            return;
        }

        const consulta = {
            cpfConsulta: userData.cpf,
            nome: userData.nome,
            telefone: userData.celular,
            data,
            hora,
            motivo,
            especialidade,
            formaPagamento,
            confirmacao: false,
            preço: null,
        };

        try {
            await addDoc(collection(db, 'consultasAgendadas'), consulta);
            setSuccessMessage('Consulta agendada com sucesso!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            setData('');
            setHora('');
            setMotivo('');
            setEspecialidade('');
            setFormaPagamento('');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert('Erro ao agendar consulta');
        }
    };

    return (
        <div className="agendamentoConsulta-main">
            <CpfSearch cpf={cpf} handleChange={handleChange} cpfStatusMessage={cpfStatusMessage} cpfStatusClass={cpfStatusClass} />

            {userData && (
                <Formik>
                    <Form>
                        <div className="agendamentoConsulta-form-body-container">
                            <h3 className="agendamentoConsulta-form-section-title">Dados pessoais</h3>
                            <div className="agendamentoConsulta-form-body">
                                <div className="agendamentoConsulta-form-group">
                                    <label>Nome civil</label>
                                    <Field type="text" name="nome" value={userData.nome || ''} readOnly disabled />
                                </div>
                                <div className="agendamentoConsulta-form-group">
                                    <label>Sexo</label>
                                    <Field name="sexo" value={userData.sexo || ''} readOnly disabled />
                                </div>
                                <div className="agendamentoConsulta-form-group">
                                    <label>Nome social</label>
                                    <Field type="text" name="nomeSocial" value={userData.nomeSocial || ''} readOnly disabled />
                                </div>
                                <div className="agendamentoConsulta-form-group">
                                    <label>Raça</label>
                                    <Field name="raca" value={userData.raca || ''} readOnly disabled />
                                </div>
                                <div className="agendamentoConsulta-form-group">
                                    <label>CPF</label>
                                    <Field name="cpf" value={userData.cpf || ''} readOnly disabled />
                                </div>
                                <div className="agendamentoConsulta-form-group">
                                    <label>Profissão</label>
                                    <Field type="text" name="profissao" value={userData.profissao || ''} readOnly disabled />
                                </div>
                            </div>
                        </div>
                        <div className="agendamentoConsulta-form-body-container">
                            <h3 className="agendamentoConsulta-form-section-title">Formas de contato</h3>
                            <div className="agendamentoConsulta-form-body">
                                <div className="agendamentoConsulta-form-group">
                                    <label>Email</label>
                                    <Field type="email" name="email" value={userData.email || ''} readOnly disabled />
                                </div>
                                <div className="agendamentoConsulta-form-group">
                                    <label>Celular</label>
                                    <Field name="celular" value={userData.celular || ''} readOnly disabled />
                                </div>
                            </div>
                        </div>
                    </Form>
                </Formik>
            )}

            <div className="agendamentoConsulta-title1" style={{ marginTop: '50px' }}>
                <h2>Preencha o formulário abaixo e confirme seu agendamento clicando em 'Confirmar'</h2>
            </div>

            <ConsultaForm
                handleSubmit={handleSubmit}
                data={data}
                setData={setData}
                hora={hora}
                setHora={setHora}
                motivo={motivo}
                setMotivo={setMotivo}
                especialidade={especialidade}
                setEspecialidade={setEspecialidade}
                formaPagamento={formaPagamento}
                setFormaPagamento={setFormaPagamento}
                isSubmitDisabled={isSubmitDisabled}
            />

            {successMessage && (
                <div className="agendamentoConsulta-success-message">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default AgendamentoConsultas;
