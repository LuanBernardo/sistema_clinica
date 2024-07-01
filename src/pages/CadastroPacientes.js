import React, { useState } from 'react';
import './CadastroPacientes.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import InputMask from 'react-input-mask';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR'; // Importe o locale para português do Brasil
import { format } from 'date-fns';

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
    return rev === parseInt(cpf.charAt(10));
};

const validateCelular = (value) => /^\(\d{2}\) \d{5}-\d{4}$/.test(value);

const CadastroPacientes = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('');

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setProfilePic(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const saveToFirestore = async (values) => {
        const pacientesRef = collection(db, "pacientes");

        const cpfQuery = query(pacientesRef, where("cpf", "==", values.cpf));
        const cpfQuerySnapshot = await getDocs(cpfQuery);

        if (!cpfQuerySnapshot.empty) {
            setFeedbackMessage('CPF já utilizado por um paciente.');
            setFeedbackType('error');
            return;
        }

        const emailQuery = query(pacientesRef, where("email", "==", values.email));
        const emailQuerySnapshot = await getDocs(emailQuery);

        if (!emailQuerySnapshot.empty) {
            setFeedbackMessage('E-mail já utilizado por um paciente.');
            setFeedbackType('error');
            return;
        }

        try {
            await addDoc(pacientesRef, {
                ...values,
                nascimento: format(values.nascimento, 'yyyy-MM-dd'), // Formata a data para DD/MM/YYYY
                profilePic
            });
            setFeedbackMessage('Paciente cadastrado com sucesso.');
            setFeedbackType('success');
        } catch (e) {
            setFeedbackMessage('Erro ao salvar paciente.');
            setFeedbackType('error');
        }
    };

    return (
        <div className="cadPaciente-container">
            <div className="cadPaciente-title1" style={{ marginTop: '-20px' }}>
                <h2>Cadastro de Pacientes
                </h2>
            </div>
            <div className="cadPaciente-form-header">
                <div className="cadPaciente-profile-section">
                    {profilePic ? (
                        <img src={profilePic} alt="Profile" className="cadPaciente-profile-pic" />
                    ) : (
                        <div className="cadPaciente-profile-placeholder">
                            <span></span>
                        </div>
                    )}
                    <label className="cadPaciente-btn include-photo-btn">
                        Incluir foto
                        <input
                            id="profilePicInput"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="cadPaciente-profile-pic-input"
                        />
                    </label>
                </div>
            </div>
            {feedbackMessage && (
                <div className={`cadPaciente-feedback-message ${feedbackType}`}>
                    {feedbackMessage}
                </div>
            )}
            <Formik
                initialValues={{
                    nome: '',
                    sexo: '',
                    email: '',
                    celular: '',
                    nomeSocial: '',
                    raca: '',
                    cpf: '',
                    profissao: '',
                    nascimento: null // Inicializado como null para o DatePicker
                }}
                validate={(values) => {
                    const errors = {};
                    if (!values.nome) errors.nome = 'Campo obrigatório';
                    if (!values.sexo) errors.sexo = 'Campo obrigatório';
                    if (!values.email) errors.email = 'Campo obrigatório';
                    if (!values.celular) {
                        errors.celular = 'Campo obrigatório';
                    } else if (!validateCelular(values.celular)) {
                        errors.celular = 'Número de celular inválido';
                    }
                    if (!values.cpf) {
                        errors.cpf = 'Campo obrigatório';
                    } else if (!validateCPF(values.cpf)) {
                        errors.cpf = 'CPF inválido';
                    }
                    if (!values.profissao) errors.profissao = 'Campo obrigatório';
                    if (!values.raca) errors.raca = 'Campo obrigatório';
                    if (!values.nascimento) {
                        errors.nascimento = 'Campo obrigatório';
                    }
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    saveToFirestore(values);
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form>
                        <div className="cadPaciente-form-body-container">
                            <h3 className="cadPaciente-form-section-title">Dados pessoais</h3>
                            <div className="cadPaciente-form-body">
                                <div className="cadPaciente-form-group">
                                    <label>Nome civil</label>
                                    <Field type="text" name="nome" placeholder="Preencha o nome do paciente" />
                                    <ErrorMessage name="nome" component="div" className="cadPaciente-error-message" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>Sexo</label>
                                    <Field as="select" name="sexo">
                                        <option value="">Selecione</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outro">Outro</option>
                                    </Field>
                                    <ErrorMessage name="sexo" component="div" className="cadPaciente-error-message" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>Nome social</label>
                                    <Field type="text" name="nomeSocial" placeholder="Preencha o nome social do paciente, se necessário" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>Raça</label>
                                    <Field as="select" name="raca">
                                        <option value="">Selecione</option>
                                        <option value="preto">Preto</option>
                                        <option value="pardo">Pardo</option>
                                        <option value="branco">Branco</option>
                                        <option value="indigena">Indígena</option>
                                        <option value="amarelo">Amarelo</option>
                                    </Field>
                                    <ErrorMessage name="raca" component="div" className="cadPaciente-error-message" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>CPF</label>
                                    <Field name="cpf" render={({ field }) => <InputMask {...field} mask="999.999.999-99" />} />
                                    <ErrorMessage name="cpf" component="div" className="cadPaciente-error-message" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>Profissão</label>
                                    <Field type="text" name="profissao" placeholder="Preencha a profissão do paciente" />
                                    <ErrorMessage name="profissao" component="div" className="cadPaciente-error-message" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>Data de Nascimento</label>
                                    <DatePicker
                                        name="nascimento"
                                        selected={values.nascimento}
                                        onChange={date => setFieldValue('nascimento', date)}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Selecione a data de nascimento"
                                        locale={ptBR}
                                        className="cadPaciente-date-picker"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                    />
                                    <ErrorMessage name="nascimento" component="div" className="cadPaciente-error-message" />
                                </div>
                            </div>
                        </div>
                        <div className="cadPaciente-form-body-container">
                            <h3 className="cadPaciente-form-section-title">Formas de contato</h3>
                            <div className="cadPaciente-form-body">
                                <div className="cadPaciente-form-group">
                                    <label>Email</label>
                                    <Field type="email" name="email" placeholder="Preencha o e-mail do paciente" />
                                    <ErrorMessage name="email" component="div" className="cadPaciente-error-message" />
                                </div>
                                <div className="cadPaciente-form-group">
                                    <label>Celular</label>
                                    <Field name="celular" render={({ field }) => <InputMask {...field} mask="(99) 99999-9999" />} />
                                    <ErrorMessage name="celular" component="div" className="cadPaciente-error-message" />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="cadPaciente-btn cadPaciente-save-btn" disabled={isSubmitting}>
                            Salvar
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CadastroPacientes;



