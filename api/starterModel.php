<?php


namespace App\Models;
use Selvi\Database\Manager;
use Selvi\Database\Schema;

class changeNama {

    private Schema $db;

    function __construct() {
        $this->db = Manager::get('main');
    }

    function count($where = [], $orWhere = []) {
        return $this->db->select('COUNT(changeTable.idchangeTable) as jmlchangeTable')
            ->where($where)->orWhere($orWhere)
            ->get('changeTable')->row()->jmlchangeTable;
    }

    function result($where = [], $orWhere = [], $order = [], $limit = -1, $offset = 0) {
        if($limit > -1) {
            $this->db->limit($limit)->offset($offset);
        }
        return $this->db->where($where)->orWhere($orWhere)
            ->order($order)->get('changeTable')->result();
    }

    function row($where) {
        return $this->db->where($where)->get('changeTable')->row();
    }

    function insert($data) {
        $insert = $this->db->insert('changeTable', $data);
        if($insert === true) return $this->db->lastId();
        return false;
    }

    function update($where, $data) {
        return $this->db->where($where)->update('changeTable', $data);
    }

    function delete($where) {
        return $this->db->where($where)->delete('changeTable');
    }

}
