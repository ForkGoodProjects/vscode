/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { workspace, WorkspaceFolder, extensions } from 'vscode';

interface ExperimentalConfig {
	customData?: string[];
	experimental?: {
		customData?: string[];
	};
}

export function getCustomDataPathsInAllWorkspaces(workspaceFolders: readonly WorkspaceFolder[] | undefined): string[] {
	const dataPaths: string[] = [];

	if (!workspaceFolders) {
		return dataPaths;
	}

	workspaceFolders.forEach(wf => {
		const allHtmlConfig = workspace.getConfiguration(undefined, wf.uri);
		const wfHtmlConfig = allHtmlConfig.inspect<ExperimentalConfig>('html');

		if (wfHtmlConfig && wfHtmlConfig.workspaceFolderValue && wfHtmlConfig.workspaceFolderValue.customData) {
			const customData = wfHtmlConfig.workspaceFolderValue.customData;
			if (Array.isArray(customData)) {
				customData.forEach(t => {
					if (typeof t === 'string') {
						dataPaths.push(path.resolve(wf.uri.fsPath, t));
					}
				});
			}
		}
	});

	return dataPaths;
}

export function getCustomDataPathsFromAllExtensions(): string[] {
	const dataPaths: string[] = [];

	for (const extension of extensions.all) {
		const contributes = extension.packageJSON && extension.packageJSON.contributes;

		if (contributes && contributes.html && contributes.html.customData && Array.isArray(contributes.html.customData)) {
			const relativePaths: string[] = contributes.html.customData;
			relativePaths.forEach(rp => {
				dataPaths.push(path.resolve(extension.extensionPath, rp));
			});
		}
	}

	return dataPaths;
}
