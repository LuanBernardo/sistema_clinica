import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DadosPessoais.css';

const DadosPessoais = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        celular: '',
        raca: '',
        nomeSocial: '',
        cpf: '',
        matricula: '',
        profissao: '',
        sexo: '',
        tipoFuncionario: '',
        crm: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userString = localStorage.getItem('user');
                const loggedUser = JSON.parse(userString);

                if (loggedUser && loggedUser.matricula && loggedUser.matricula.trim() !== '') {
                    const q = query(collection(db, 'funcionarios'), where('matricula', '==', loggedUser.matricula));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        setUser({ id: userDoc.id, ...userDoc.data() });
                        setFormData(userDoc.data());
                    } else {
                        setError('Documento não encontrado para a matrícula do usuário.');
                    }
                } else {
                    setError('Usuário não encontrado ou matrícula não está definida corretamente.');
                }
            } catch (error) {
                setError('Erro ao buscar dados do usuário.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (user && user.id) {
                const docRef = doc(db, 'funcionarios', user.id);
                await updateDoc(docRef, formData);
                setSuccessMessage('Dados atualizados com sucesso!');
            } else {
                setError('ID do usuário não está definido ou usuário não encontrado.');
            }
        } catch (error) {
            setError('Erro ao atualizar dados do usuário.');
        }
    };

    const isAdminOrAtendente = formData.tipoFuncionario === 'admin' || formData.tipoFuncionario === 'atendente';

    if (loading) {
        return <div className="dados-pessoais-container"><p>Carregando dados do usuário...</p></div>;
    }

    if (error) {
        return <div className="dados-pessoais-container"><p>{error}</p></div>;
    }

    return (
        <div className="dados-pessoais-container">
            <h2 className="historico-paciente-titulo1" style={{ marginTop: '-20px' }}>Dados Pessoais</h2>
            {successMessage && (
                <div className="dados-pessoais-feedback-message success">
                    {successMessage}
                </div>
            )}
            {user ? (
                <form onSubmit={handleSubmit}>
                    <div className="dados-pessoais-form-body-container">
                        <h3 className="dados-pessoais-form-section-title">Dados pessoais</h3>
                        <div className="dados-pessoais-form-body">
                            <div className="dados-pessoais-form-group">
                                <label>Nome</label>
                                <input type="text" name="nome" value={formData.nome} onChange={handleChange} disabled />
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>Sexo</label>
                                <select name="sexo" value={formData.sexo} onChange={handleChange} disabled>
                                    <option value="">Selecione</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>Nome Social</label>
                                <input type="text" name="nomeSocial" value={formData.nomeSocial} onChange={handleChange} />
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>Raça</label>
                                <select name="raca" value={formData.raca} onChange={handleChange} disabled>
                                    <option value="">Selecione</option>
                                    <option value="preto">Preto</option>
                                    <option value="pardo">Pardo</option>
                                    <option value="branco">Branco</option>
                                    <option value="indigena">Indígena</option>
                                    <option value="amarelo">Amarelo</option>
                                </select>
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>CPF</label>
                                <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} disabled />
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>Profissão</label>
                                <input type="text" name="profissao" value={formData.tipoFuncionario} onChange={handleChange} disabled/>
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>Matrícula</label>
                                <input type="text" name="profissao" value={formData.matricula} onChange={handleChange} disabled/>
                            </div>
                            {!isAdminOrAtendente && (
                                <div className="dados-pessoais-form-group">
                                    <label>CRM</label>
                                    <input type="text" name="CRM" value={formData.crm} onChange={handleChange} disabled/>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="dados-pessoais-form-body-container">
                        <h3 className="dados-pessoais-form-section-title">Formas de contato</h3>
                        <div className="dados-pessoais-form-body">
                            <div className="dados-pessoais-form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="dados-pessoais-form-group">
                                <label>Celular</label>
                                <input type="text" name="celular" value={formData.celular} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="dados-pessoais-btn dados-pessoais-save-btn">
                        Salvar
                    </button>
                </form>
            ) : (
                <p>Usuário não encontrado!</p>
            )}
        </div>
    );
};

export default DadosPessoais;
