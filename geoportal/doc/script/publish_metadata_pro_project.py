#Go through list of ArcGIS Pro projects, generate metadata for each map and feature layer and publishes those to Geoportal Sever 2.x
import codecs
import os
import sys

os.environ["ARCPY_NO_IMPORTS"] = "1"

import requests
from requests.auth import HTTPBasicAuth
import arcpy

start_dir = r"C:\data\arcgis"  # the physical folder where metadata xml files will be exported
project_dir = r"C:\data\projects"  # the physical folder for ArcGIS Pro projects
project_list = ["ScriptForMap_GroupLayer.aprx"] #add comma separated list of pro projects, remaining will be skipped
#if empty list, all pro projects in this location will be processed
item_list = ["Map", "Basemap"] #add comma separated list of item (Map, layers),remaining will be skipped
#if empty list, all items will be processed

# The URL for the geoportal 2.x's document management API.
# server = 'http://<server>:<port>/geoportal/rest/metadata/item'
server = 'http://localhost:8080/geoportal/rest/metadata/item'

token = arcpy.GetSigninToken()
if token is None:
    sys.exit("Please sign in to Portal to execute this script.")
portal_desc = arcpy.GetPortalDescription()
poartusername = portal_desc['user']['username']
#auth = HTTPBasicAuth('', '')
auth = HTTPBasicAuth(poartusername, '__rtkn__:' + token['token'])
headers = {"Content-Type": "application/json; charset=utf-8"}

def read_publish_metadata():
    #scan folder if any project(.aprx) exists
    file_list = os.listdir(project_dir)   
    # Checking if the list is empty or not 
    if len(file_list) == 0: 
        print("There are no ArcGIS Pro projects. Please copy the projects in ",project_dir)
    else: 
        #look for .aprx files as mentioned in project_list
        if len(project_list) == 0:
            print("processing all ArcGIS Pro projects")
            for file in file_list :
                file_path = os.path.join(project_dir, file)
                if os.path.isfile(file_path):
                    if file.endswith('.aprx'):
                        print("processing project",file)
                        process_project(file)
                    else:
                        print("This file is not ArcGIS Pro project. Skipping", file)
        else:
            for file in file_list:
                file_path = os.path.join(project_dir, file)
                if os.path.isfile(file_path):
                    if file in project_list:
                        print("processing project",file)
                        process_project(file)
                    else:
                        print("skipping", file)
       
            
def process_project(pro_project):
    print("reading metadata for " + pro_project)
    pro_project_path = os.path.join(project_dir, pro_project)
    print("pro_project_path",pro_project_path)
    
    project =  arcpy.mp.ArcGISProject(pro_project_path)
    # Get a list of all maps in the project
    map_list = project.listMaps()

    # Access the first map in the list
    for map_obj in map_list:
        if len(item_list)==0: #process all items
            read_publish_item(map_obj)
        else:
            if map_obj.name in item_list:
                print("reading metadata for map", map_obj.name)
                read_publish_item(map_obj)

        layer_list = map_obj.listLayers()
        for layer_obj in layer_list:
            if len(item_list) == 0:  # process all items
                read_publish_item(layer_obj)
            else:
                if layer_obj.name in item_list:
                    print("reading metadata for layer", layer_obj.name)
                    read_publish_item(layer_obj)

    print("Publishing metadata completed.")
        
def read_publish_item(item):
    search_txt = '<mdb:MD_Metadata'
    header_template = """<mdb:MD_Metadata xmlns:cat="http://standards.iso.org/iso/19115/-3/cat/1.0" xmlns:cit="http://standards.iso.org/iso/19115/-3/cit/2.0" xmlns:gcx="http://standards.iso.org/iso/19115/-3/gcx/1.0" xmlns:gex="http://standards.iso.org/iso/19115/-3/gex/1.0" xmlns:lan="http://standards.iso.org/iso/19115/-3/lan/1.0" xmlns:srv="http://standards.iso.org/iso/19115/-3/srv/2.0" xmlns:mac="http://standards.iso.org/iso/19115/-3/mac/2.0" xmlns:mas="http://standards.iso.org/iso/19115/-3/mas/1.0" xmlns:mcc="http://standards.iso.org/iso/19115/-3/mcc/1.0" xmlns:mco="http://standards.iso.org/iso/19115/-3/mco/1.0" xmlns:mda="http://standards.iso.org/iso/19115/-3/mda/1.0" xmlns:mdb="http://standards.iso.org/iso/19115/-3/mdb/2.0" xmlns:mdt="http://standards.iso.org/iso/19115/-3/mdt/1.0" xmlns:mex="http://standards.iso.org/iso/19115/-3/mex/1.0" xmlns:mrl="http://standards.iso.org/iso/19115/-3/mrl/1.0" xmlns:mds="http://standards.iso.org/iso/19115/-3/mds/1.0" xmlns:mmi="http://standards.iso.org/iso/19115/-3/mmi/1.0" xmlns:mpc="http://standards.iso.org/iso/19115/-3/mpc/1.0" xmlns:mrc="http://standards.iso.org/iso/19115/-3/mrc/2.0" xmlns:mrd="http://standards.iso.org/iso/19115/-3/mrd/1.0" xmlns:mri="http://standards.iso.org/iso/19115/-3/mri/1.0" xmlns:mrs="http://standards.iso.org/iso/19115/-3/mrs/1.0" xmlns:msr="http://standards.iso.org/iso/19115/-3/msr/2.0" xmlns:mdq="http://standards.iso.org/iso/19157/-2/mdq/1.0" xmlns:dqc="http://standards.iso.org/iso/19157/-2/dqc/1.0" xmlns:gco="http://standards.iso.org/iso/19115/-3/gco/1.0" xmlns:gfc="http://standards.iso.org/iso/19110/gfc/1.1" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">"""
    item_md = item.metadata

    #if metadata is maintained in source
    if item_md == False:
        print("No metadata for ",item.name)
        return
    # Synchronize the item's metadata now
    item_md.synchronize('ALWAYS')
    item_name =  item.name
    slash_index = item.name.find('/')
    if slash_index > -1:
        item_name = item.name[slash_index+1:]

    #print("item name after substring /",item_name)
    export_path = os.path.join(start_dir,item_name )

    export_file_path = export_path+'.xml'
    export_file_mod_path = export_path + '_mod.xml'

    #print(export_file_path)
    try:
        item_md.exportMetadata(export_file_path, 4,
                                   metadata_removal_option='REMOVE_ALL_SENSITIVE_INFO')

        with open(export_file_path, 'r', encoding='utf-8') as file:
            file_content = file.readlines()

        # Find line, where modification should be done
        for lineIndex in range(len(file_content)):
            if search_txt in file_content[lineIndex]:
                print("modifying header")
                file_content[lineIndex] = header_template
                with open(export_file_mod_path, 'w+', encoding='utf-8') as modifiedfile:
                    modifiedfile.writelines(file_content)
                    break

        if len(file_content) > 0:
            mod_content = ' '.join(file_content)
            print("publishing metadata for " + item_name)
            publish_metadata(mod_content)
    except Exception as error:
        print("Error publishing metadata ",error)
            
def publish_metadata(metadata):
    #print("metadata",metadata)
    r = requests.put(url=server, data=metadata, auth=auth, headers=headers,verify=False)
    try:
        result = r.json()
        print(f"{r.status_code} content['resTitle'] - {result}\n'")
    except ValueError:
        print(r)
        
def main():
    read_publish_metadata()

if __name__ == '__main__':
    main()
        
