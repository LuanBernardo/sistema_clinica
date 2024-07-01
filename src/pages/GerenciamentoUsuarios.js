import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import './GerenciamentoUsuarios.css';

const GerenciamentoUsuarios = () => {
    const [mensagemErro, setMensagemErro] = useState('');
    const [pacientes, setPacientes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [formEdicao, setFormEdicao] = useState({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        matricula: '', // Adicionado campo matricula
        tipoFuncionario: '', // Adicionado campo tipoFuncionario
        senha: '' // Adicionado campo senha (mascarado)
    });
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [tabelaVisivel, setTabelaVisivel] = useState('funcionarios');

    // Função para buscar pacientes
    const fetchPacientes = async () => {
        try {
            const pacientesCollection = collection(db, "pacientes");
            const querySnapshot = await getDocs(pacientesCollection);
            const pacientesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPacientes(pacientesList);
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
        }
    };

    // Função para buscar funcionários
    const fetchFuncionarios = async () => {
        try {
            const funcionariosCollection = collection(db, "funcionarios");
            const querySnapshot = await getDocs(funcionariosCollection);
            const funcionariosList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFuncionarios(funcionariosList);
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        }
    };

    useEffect(() => {
        fetchPacientes();
        fetchFuncionarios();
    }, []);

    const handleDeleteUsuario = async (id, tipoUsuario) => {
        const confirmDelete = window.confirm(`Tem certeza que deseja remover este ${tipoUsuario}?`);
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, `${tipoUsuario}s`, id));
                tipoUsuario === 'paciente' ? fetchPacientes() : fetchFuncionarios();
            } catch (error) {
                console.error(`Erro ao deletar ${tipoUsuario}:`, error);
            }
        }
    };

    const handleEditarUsuario = (usuario) => {
        setUsuarioSelecionado(usuario);
        setFormEdicao({
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email || '',
            telefone: usuario.celular || '',
            matricula: usuario.matricula || '', // Preenche com matrícula se existir
            tipoFuncionario: usuario.tipoFuncionario || '', // Preenche com tipo de funcionário se existir
            senha: '******' // Define a senha como mascarada no modal
        });
        setModalAberto(true);
    };

    const handleSalvarAlteracoes = async () => {
        try {
            const usuarioRef = doc(db, `${usuarioSelecionado.tipo}s`, usuarioSelecionado.id);
    
            // Remove a senha do formEdicao se ela não foi alterada
            const dadosAtualizados = { ...formEdicao };
            if (dadosAtualizados.senha === '******') {
                delete dadosAtualizados.senha;
            }
    
            // Verificar se CPF, matrícula ou email já existem
            const querySnapshot = await getDocs(collection(db, `${usuarioSelecionado.tipo}s`));
            const usuariosExistentes = querySnapshot.docs.map(doc => doc.data());
    
            const cpfExiste = usuariosExistentes.some(user => user.cpf === dadosAtualizados.cpf && user.id !== usuarioSelecionado.id);
            const matriculaExiste = usuariosExistentes.some(user => user.matricula === dadosAtualizados.matricula && user.id !== usuarioSelecionado.id);
            const emailExiste = usuariosExistentes.some(user => user.email === dadosAtualizados.email && user.id !== usuarioSelecionado.id);
    
            if (cpfExiste || matriculaExiste || emailExiste) {
                setMensagemErro('Alteração não concluída. Pois o CPF, matrícula ou email já está vinculado a outro usuário.');
                return;
            }
    
            await updateDoc(usuarioRef, dadosAtualizados);
            setMensagemSucesso('Alterações salvas com sucesso!');
            usuarioSelecionado.tipo === 'paciente' ? fetchPacientes() : fetchFuncionarios();
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
        } finally {
            setModalAberto(false);
            setUsuarioSelecionado(null);
            setFormEdicao({
                nome: '',
                cpf: '',
                email: '',
                telefone: '',
                matricula: '',
                tipoFuncionario: '',
                senha: ''
            });
        }
    };

    const handleCancelarEdicao = () => {
        setModalAberto(false);
        setUsuarioSelecionado(null);
        setFormEdicao({
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            matricula: '',
            tipoFuncionario: '',
            senha: ''
        });
    };

    return (
        <div className="main">
            <h2 className="historico-paciente-titulo1" style={{ marginTop: '-20px' }}>Gerenciamento de Usuários</h2>

            <div className="content">
                <div className="toggle-buttons" style={{ marginRight: '450px' }}>
                    <button style={{ backgroundColor: '#16a086' }} onClick={() => setTabelaVisivel('pacientes')}>Ver Pacientes</button>
                    <button style={{ backgroundColor: '#16a086' }} onClick={() => setTabelaVisivel('funcionarios')}>Ver Funcionários</button>
                    <button style={{ backgroundColor: '#16a086' }} onClick={() => setTabelaVisivel('ambos')}>Ver Ambos</button>
                </div>

                {tabelaVisivel !== 'funcionarios' && (
                    <div>
                        <h2 style={{ marginLeft: '425px' }}>Pacientes</h2>
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Email</th>
                                    <th>Telefone</th>
                                    <th>Data de Nascimento</th>
                                    <th>Editar</th>
                                    <th>Remover</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.map((paciente, index) => (
                                    <tr key={index}>
                                        <td>{paciente.nome}</td>
                                        <td>{paciente.cpf}</td>
                                        <td>{paciente.email}</td>
                                        <td>{paciente.celular}</td>
                                        <td>{paciente.nascimento}</td>
                                        <td><button className = "alterar" onClick={() => handleEditarUsuario({ ...paciente, tipo: 'paciente' })}>Editar</button></td>
                                        <td><button className = "deletar" onClick={() => handleDeleteUsuario(paciente.id, 'paciente')}>Remover</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tabelaVisivel !== 'pacientes' && (
                    <div>
                        <h2 style={{ marginLeft: '400px' }}>Funcionários</h2>
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Email</th>
                                    <th>Telefone</th>
                                    <th>Matrícula</th> {/* Adicionado cabeçalho da coluna Matrícula */}
                                    <th>Tipo de Funcionário</th> {/* Adicionado cabeçalho da coluna Tipo de Funcionário */}
                                    <th>Editar</th>
                                    <th>Remover</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funcionarios.map((funcionario, index) => (
                                    <tr key={index}>
                                        <td>{funcionario.nome}</td>
                                        <td>{funcionario.cpf}</td>
                                        <td>{funcionario.email}</td>
                                        <td>{funcionario.celular}</td>
                                        <td>{funcionario.matricula}</td> {/* Adicionado campo Matrícula */}
                                        <td>{funcionario.tipoFuncionario}</td> {/* Adicionado campo Tipo de Funcionário */}
                                        <td><button className="editar" onClick={() => handleEditarUsuario({ ...funcionario, tipo: 'funcionario' })}>Editar</button></td>
                                        <td><button className="deletar" onClick={() => handleDeleteUsuario(funcionario.id, 'funcionario')}>Remover</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de edição */}
            {modalAberto && usuarioSelecionado && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar {usuarioSelecionado.tipo === 'paciente' ? 'Paciente' : 'Funcionário'}</h2>
                        <div>
                            <label>Nome:</label>
                            <input
                                type="text"
                                value={formEdicao.nome}
                                onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>CPF:</label>
                            <input
                                type="text"
                                value={formEdicao.cpf}
                                onChange={(e) => setFormEdicao({ ...formEdicao, cpf: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={formEdicao.email}
                                onChange={(e) => setFormEdicao({ ...formEdicao, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Telefone:</label>
                            <input
                                type="text"
                                value={formEdicao.telefone}
                                onChange={(e) => setFormEdicao({ ...formEdicao, telefone: e.target.value })}
                            />
                        </div>
                        {/* Campos adicionais para Funcionários */}
                        {usuarioSelecionado.tipo === 'funcionario' && (
                            <>
                                <div>
                                    <label>Matrícula:</label>
                                    <input
                                        type="text"
                                        value={formEdicao.matricula}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, matricula: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Tipo de Funcionário:</label>

                                    <select
                                        type="text"
                                        name="tipoFuncionario"
                                        value={formEdicao.tipoFuncionario}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, tipoFuncionario: e.target.value })}
                                    >
                                        <option value="">Escolha o tipo</option>
                                        <option value="atendente">Atendente</option>
                                        <option value="medico">Médico</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Senha:</label>
                                    <input
                                        type="password" // Senha mascarada
                                        value={formEdicao.senha}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, senha: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                        <div className="modal-buttons">
                            <button onClick={handleSalvarAlteracoes}>Salvar</button>
                            <button onClick={handleCancelarEdicao}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensagem de sucesso */}
            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    <p>{mensagemSucesso}</p>
                </div>
            )}

            {/* Mensagem de erro */}
            {mensagemErro && (
                <div className="mensagem-erro">
                    <p>{mensagemErro}</p>
                </div>
            )}
        </div>
    );
};

export default GerenciamentoUsuarios;
