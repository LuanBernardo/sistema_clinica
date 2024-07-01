// src/components/CalendarioConsultas.js

import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import './CalendarioConsultas.css'; // Importe o arquivo CSS

const CalendarioConsultas = () => {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [consultas, setConsultas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [modalAberto, setModalAberto] = useState(false);
    const [consultaSelecionada, setConsultaSelecionada] = useState(null);
    const [formEdicao, setFormEdicao] = useState({
        data: '',
        hora: '',
        motivo: '',
        especialidade: '',
        formaPagamento: ''
    });
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const fetchConsultas = async () => {
        try {
            const consultasCollection = collection(db, "consultasAgendadas");
            let consultasQuery = consultasCollection;

            if (dataInicio && dataFim) {
                consultasQuery = query(consultasCollection,
                    where("data", ">=", dataInicio),
                    where("data", "<=", dataFim)
                );
            }

            const querySnapshot = await getDocs(consultasQuery);
            let consultasList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            consultasList.sort((consulta1, consulta2) => {
                const dataHora1 = `${consulta1.data} ${consulta1.hora}`;
                const dataHora2 = `${consulta2.data} ${consulta2.hora}`;
                return dataHora1.localeCompare(dataHora2);
            });

            setConsultas(consultasList);
            setCurrentPage(1);

        } catch (error) {
            console.error("Erro ao buscar consultas:", error);
        }
    };

    useEffect(() => {
        fetchConsultas();
    }, [dataInicio, dataFim]);

    const handleDeleteConsulta = async (id) => {
        const confirmDelete = window.confirm("Tem certeza que deseja deletar esta consulta?");
        
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "consultasAgendadas", id));
                fetchConsultas();
            } catch (error) {
                console.error("Erro ao deletar consulta:", error);
            }
        }
    };

    const handleUpdateConfirmacao = async (id, confirmada) => {
        try {
            const consultaRef = doc(db, "consultasAgendadas", id);
            await updateDoc(consultaRef, {
                confirmacao: confirmada
            });
            fetchConsultas();
            setMensagemSucesso('Alteração concluída com sucesso!');
            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);
        } catch (error) {
            console.error("Erro ao atualizar confirmação:", error);
        }
    };

    const handleAlterarConsulta = (consulta) => {
        setConsultaSelecionada(consulta);
        setFormEdicao({
            data: consulta.data,
            hora: consulta.hora,
            motivo: consulta.motivo,
            especialidade: consulta.especialidade,
            formaPagamento: consulta.formaPagamento
        });
        setModalAberto(true);
    };

    const handleSalvarAlteracoes = async () => {
        const confirmacao = window.confirm("Tem certeza que deseja salvar as alterações?");
        
        if (confirmacao) {
            try {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);  // Remove a hora para comparação apenas de data
                const dataEdicao = new Date(formEdicao.data);
                
                if (dataEdicao <= hoje) {
                    alert("Por favor, selecione uma data válida, posterior ao dia de hoje.");
                    return;
                }
                
                const consultaConflitante = consultas.find(consulta => (
                    consulta.id !== consultaSelecionada.id &&
                    consulta.data === formEdicao.data &&
                    consulta.hora === formEdicao.hora &&
                    consulta.especialidade === formEdicao.especialidade
                ));
                
                if (consultaConflitante) {
                    alert("Já existe uma consulta agendada para o mesmo dia, horário e especialidade.");
                    return;
                }
                
                const consultaRef = doc(db, "consultasAgendadas", consultaSelecionada.id);
                await updateDoc(consultaRef, {
                    data: formEdicao.data,
                    hora: formEdicao.hora,
                    motivo: formEdicao.motivo,
                    especialidade: formEdicao.especialidade,
                    formaPagamento: formEdicao.formaPagamento
                });
                fetchConsultas();
                setModalAberto(false);
                setConsultaSelecionada(null);
                setFormEdicao({
                    data: '',
                    hora: '',
                    motivo: '',
                    especialidade: '',
                    formaPagamento: ''
                });
                setMensagemSucesso('Alteração concluída com sucesso!');
                setTimeout(() => {
                    setMensagemSucesso('');
                }, 3000);
            } catch (error) {
                console.error("Erro ao atualizar consulta:", error);
            }
        }
    };
    
    
    const handleCancelarEdicao = () => {
        setModalAberto(false);
        setConsultaSelecionada(null);
        setFormEdicao({
            data: '',
            hora: '',
            motivo: '',
            especialidade: '',
            formaPagamento: ''
        });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = consultas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(consultas.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="main">
            <div className="calConsultas-title1" style={{ marginTop: '-20px' }}>
                <h2>Calendário de Consultas
                </h2>
            </div>
            <div className="title">
                <h2>Escolha a faixa de tempo que você deseja verificar quais consultas estão marcadas.</h2>
                <div className="form-group">
    <div className="date-container">
        <label>Data Início:</label>
        <input
            type="date"
            name="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
        />
        <label>Data Fim:</label>
        <input
            type="date"
            name="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
        />
    </div>
</div>
            </div>

            <div className="title" style={{ marginTop: '50px' }}>
                <h2>Consulte e interaja com as consultas do dia, da maneira como preferir.</h2>
                <table className="tabela1">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>Motivo</th>
                            <th>Especialidade</th>
                            <th>Forma de Pagamento</th>
                            <th>Confirmar</th>
                            <th>Alterar</th>
                            <th>Deletar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((consulta, index) => (
                                <tr key={index}>
                                    <td>{consulta.data}</td>
                                    <td>{consulta.hora}</td>
                                    <td>{consulta.nome}</td>
                                    <td>{consulta.cpfConsulta}</td>
                                    <td>{consulta.telefone}</td>
                                    <td>{consulta.motivo}</td>
                                    <td>{consulta.especialidade}</td>
                                    <td>{consulta.formaPagamento}</td>
                                    <td>
                                        <select
                                            name="Confirmação"
                                            value={consulta.confirmacao ? "True" : "False"}
                                            onChange={(e) => {
                                                const confirmada = e.target.value === "True";
                                                handleUpdateConfirmacao(consulta.id, confirmada);
                                            }}
                                            required
                                        >
                                            <option value="True">Confirmada</option>
                                            <option value="False">Não Confirmada</option>
                                        </select>
                                    </td>
                                    <td><button className="alterar" onClick={() => handleAlterarConsulta(consulta)}>Alterar</button></td>
                                    <td><button className="deletar" onClick={() => handleDeleteConsulta(consulta.id)}>Deletar</button></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">Nenhuma consulta encontrada para esta faixa de tempo.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</button>
                    <span>{currentPage} de {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Próxima</button>
                </div>
            </div>

            {modalAberto && consultaSelecionada && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar Consulta</h2>
                        <div>
                            <label>Data:</label>
                            <input
                                type="date"
                                value={formEdicao.data}
                                onChange={(e) => setFormEdicao({ ...formEdicao, data: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Hora:</label>
                            <input
                                type="time"
                                value={formEdicao.hora}
                                onChange={(e) => setFormEdicao({ ...formEdicao, hora: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Motivo:</label>
                            <input
                                type="text"
                                value={formEdicao.motivo}
                                onChange={(e) => setFormEdicao({ ...formEdicao, motivo: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Especialidade:</label>
                            <select
                                name="especialidade"
                                value={formEdicao.especialidade}
                                onChange = {(e) => setFormEdicao({... formEdicao, especialidade: e.target.value})}
                            
                            >
                                <option value="Clínico Geral">Clínico Geral</option>
                                <option value="Pediatria">Pediatria</option>
                                <option value="Cardiologia">Cardiologia</option>
                            </select>
                        </div>
                        <div>
                            <label>Forma de Pagamento:</label>
                            <select
                                name="formaPagamento"
                                value={formEdicao.formaPagamento}
                                onChange={(e) => setFormEdicao({ ...formEdicao, formaPagamento: e.target.value })}
                            >
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Cartão de Débito">Cartão de Débito</option>
                                <option value="PIX">PIX</option>
                                <option value="Dinheiro">Dinheiro</option>
                            </select>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleSalvarAlteracoes}>Salvar</button>
                            <button onClick={handleCancelarEdicao}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    <p>{mensagemSucesso}</p>
                </div>
            )}
        </div>
    );
};

export default CalendarioConsultas;
