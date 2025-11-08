import React, { useState, useEffect, useCallback } from 'react';
import { Config } from '../types';
import { getConfig, saveConfig, validateConfig } from '../services/testCaseService';
import { SettingsIcon, LoadingSpinner, CheckCircleIcon, XCircleIcon } from './icons';
import Notification from './Notification';

type NotificationType = 'success' | 'error' | 'info';
type NotificationState = { id: number; message: string; type: NotificationType };

const ConfigPage: React.FC = () => {
    const [config, setConfig] = useState<Config>({
        atlassian_url: '',
        atlassian_email: '',
        project_key: '',
        ai_model: 'gpt-4o',
        repo_path: '',
        git_provider: 'auto',
        default_branch: 'master',
        auto_upload: false,
        auto_create_pr: true,
        ai_tool: 'aider'
    });
    
    const [atlassianApiToken, setAtlassianApiToken] = useState('');
    const [zephyrApiToken, setZephyrApiToken] = useState('');
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState<NotificationState[]>([]);
    const [validationStatus, setValidationStatus] = useState<{
        jira?: boolean | null;
        zephyr?: boolean | null;
        openai?: boolean | null;
    }>({});

    const triggerNotification = useCallback((message: string, type: NotificationType) => {
        const newNotification = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const handleDismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getConfig();
            setConfig(data);
        } catch (error) {
            triggerNotification('Failed to load configuration. Using defaults.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [triggerNotification]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleValidate = async (service: 'jira' | 'zephyr' | 'openai') => {
        let validationData: any = {};
        
        if (service === 'jira') {
            validationData = {
                atlassian_url: config.atlassian_url,
                atlassian_api_token: atlassianApiToken
            };
        } else if (service === 'zephyr') {
            validationData = {
                zephyr_api_token: zephyrApiToken
            };
        } else if (service === 'openai') {
            validationData = {
                openai_api_key: openaiApiKey
            };
        }

        try {
            const result = await validateConfig(service, validationData);
            setValidationStatus(prev => ({ ...prev, [service]: result.valid }));
            triggerNotification(result.message, result.valid ? 'success' : 'error');
        } catch (error) {
            setValidationStatus(prev => ({ ...prev, [service]: false }));
            triggerNotification(`Failed to validate ${service}.`, 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const configToSave = {
                ...config,
                atlassian_api_token: atlassianApiToken || undefined,
                zephyr_api_token: zephyrApiToken || undefined,
                openai_api_key: openaiApiKey || undefined
            };
            await saveConfig(configToSave);
            triggerNotification('Configuration saved successfully!', 'success');
        } catch (error) {
            triggerNotification('Failed to save configuration.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const Card: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center space-x-3">
                {icon}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );

    const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
        <input 
            {...props} 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500" 
        />
    );

    const ValidationButton: React.FC<{ service: 'jira' | 'zephyr' | 'openai'; disabled: boolean }> = ({ service, disabled }) => {
        const status = validationStatus[service];
        return (
            <button
                type="button"
                onClick={() => handleValidate(service)}
                disabled={disabled}
                className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
                {status === true && <CheckCircleIcon className="w-4 h-4 text-green-400" />}
                {status === false && <XCircleIcon className="w-4 h-4 text-red-400" />}
                <span>Validate</span>
            </button>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner className="w-12 h-12 text-indigo-500" />
            </div>
        );
    }

    return (
        <>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Configuration</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage your Womba platform settings and API credentials.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Atlassian Configuration */}
                    <Card title="Atlassian Configuration" icon={<SettingsIcon className="w-6 h-6 text-indigo-400" />}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="atlassian_url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Atlassian URL
                                </label>
                                <InputField
                                    id="atlassian_url"
                                    type="url"
                                    value={config.atlassian_url || ''}
                                    onChange={e => setConfig({ ...config, atlassian_url: e.target.value })}
                                    placeholder="https://your-domain.atlassian.net"
                                />
                            </div>
                            <div>
                                <label htmlFor="atlassian_email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Atlassian Email
                                </label>
                                <InputField
                                    id="atlassian_email"
                                    type="email"
                                    value={config.atlassian_email || ''}
                                    onChange={e => setConfig({ ...config, atlassian_email: e.target.value })}
                                    placeholder="your-email@example.com"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="atlassian_api_token" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Atlassian API Token
                                    </label>
                                    <ValidationButton 
                                        service="jira" 
                                        disabled={!config.atlassian_url || !atlassianApiToken} 
                                    />
                                </div>
                                <InputField
                                    id="atlassian_api_token"
                                    type="password"
                                    value={atlassianApiToken}
                                    onChange={e => setAtlassianApiToken(e.target.value)}
                                    placeholder="Enter your API token"
                                />
                            </div>
                            <div>
                                <label htmlFor="project_key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Default Project Key
                                </label>
                                <InputField
                                    id="project_key"
                                    type="text"
                                    value={config.project_key || ''}
                                    onChange={e => setConfig({ ...config, project_key: e.target.value })}
                                    placeholder="PROJ"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Zephyr Configuration */}
                    <Card title="Zephyr Scale Configuration" icon={<SettingsIcon className="w-6 h-6 text-indigo-400" />}>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="zephyr_api_token" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Zephyr API Token
                                </label>
                                <ValidationButton 
                                    service="zephyr" 
                                    disabled={!zephyrApiToken} 
                                />
                            </div>
                            <InputField
                                id="zephyr_api_token"
                                type="password"
                                value={zephyrApiToken}
                                onChange={e => setZephyrApiToken(e.target.value)}
                                placeholder="Enter your Zephyr API token"
                            />
                        </div>
                    </Card>

                    {/* AI Configuration */}
                    <Card title="AI Configuration" icon={<SettingsIcon className="w-6 h-6 text-indigo-400" />}>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="openai_api_key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        OpenAI API Key
                                    </label>
                                    <ValidationButton 
                                        service="openai" 
                                        disabled={!openaiApiKey} 
                                    />
                                </div>
                                <InputField
                                    id="openai_api_key"
                                    type="password"
                                    value={openaiApiKey}
                                    onChange={e => setOpenaiApiKey(e.target.value)}
                                    placeholder="sk-..."
                                />
                            </div>
                            <div>
                                <label htmlFor="ai_model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    AI Model
                                </label>
                                <select
                                    id="ai_model"
                                    value={config.ai_model}
                                    onChange={e => setConfig({ ...config, ai_model: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="ai_tool" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    AI Tool
                                </label>
                                <select
                                    id="ai_tool"
                                    value={config.ai_tool}
                                    onChange={e => setConfig({ ...config, ai_tool: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="aider">Aider</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Automation Configuration */}
                    <Card title="Automation Configuration" icon={<SettingsIcon className="w-6 h-6 text-indigo-400" />}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="repo_path" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Repository Path
                                </label>
                                <InputField
                                    id="repo_path"
                                    type="text"
                                    value={config.repo_path || ''}
                                    onChange={e => setConfig({ ...config, repo_path: e.target.value })}
                                    placeholder="/path/to/repository"
                                />
                            </div>
                            <div>
                                <label htmlFor="git_provider" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Git Provider
                                </label>
                                <select
                                    id="git_provider"
                                    value={config.git_provider}
                                    onChange={e => setConfig({ ...config, git_provider: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="auto">Auto-detect</option>
                                    <option value="github">GitHub</option>
                                    <option value="gitlab">GitLab</option>
                                    <option value="bitbucket">Bitbucket</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="default_branch" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Default Branch
                                </label>
                                <InputField
                                    id="default_branch"
                                    type="text"
                                    value={config.default_branch}
                                    onChange={e => setConfig({ ...config, default_branch: e.target.value })}
                                    placeholder="master"
                                />
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    id="auto_upload"
                                    type="checkbox"
                                    checked={config.auto_upload}
                                    onChange={e => setConfig({ ...config, auto_upload: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="auto_upload" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Auto-upload to Zephyr
                                </label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    id="auto_create_pr"
                                    type="checkbox"
                                    checked={config.auto_create_pr}
                                    onChange={e => setConfig({ ...config, auto_create_pr: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="auto_create_pr" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Auto-create Pull Requests
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center transition-colors hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <LoadingSpinner className="w-5 h-5 mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="fixed top-20 right-5 w-full max-w-sm z-50 flex flex-col space-y-3">
                {notifications.map(notif => (
                    <Notification
                        key={notif.id}
                        id={notif.id}
                        message={notif.message}
                        type={notif.type}
                        onDismiss={handleDismissNotification}
                    />
                ))}
            </div>
        </>
    );
};

export default ConfigPage;

